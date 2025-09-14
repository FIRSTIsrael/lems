import os
import logging
import pandas as pd

import psycopg
from psycopg.rows import dict_row
from pymongo import MongoClient
from dotenv import load_dotenv

from models.lems import Team as TeamModel, Location as LocationModel

is_production = os.getenv("PYTHON_ENV") == "production"
env_file = ".env" if is_production else ".env.local"
load_dotenv(env_file)

logger = logging.getLogger("lems.scheduler")


class LemsRepository:
    def __init__(self, divisionId: str):
        # PostgreSQL connection
        pg_host = os.getenv("PG_HOST", "127.0.0.1")
        pg_port = os.getenv("PG_PORT", "5432")
        pg_user = os.getenv("PG_USER", "postgres")
        pg_password = os.getenv("PG_PASSWORD", "postgres")
        pg_database = os.getenv("DB_NAME", "lems-local")

        postgres_uri = (
            f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_database}"
        )

        self.divisionId = divisionId

        try:
            self.pg_conn = psycopg.connect(postgres_uri, row_factory=dict_row)
            logger.info(
                f"🔗 Connecting to PostgreSQL server at {pg_host}:{pg_port}/{pg_database}"
            )
            logger.info("🚀 PostgreSQL Client connected.")
        except Exception as err:
            logger.error("❌ Unable to connect to PostgreSQL: ", err)
            raise

        # MongoDB connection
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        self.mongo_client = MongoClient(
            mongodb_uri,
            tls=os.getenv("PYTHON_ENV") == "production",
            tlsAllowInvalidCertificates=True,
        )
        self.mongo_db = self.mongo_client["lems"]
        logger.info(f"🔗 Connecting to MongoDB server at {mongodb_uri}")
        try:
            self.mongo_client.admin.command("ping")
            logger.info("🚀 MongoDB Client connected.")
        except Exception as err:
            logger.error("❌ Unable to connect to MongoDB: ", err)

    def get_teams(self) -> list[TeamModel]:
        with self.pg_conn.cursor() as cursor:
            cursor.execute(
                "SELECT t.id, t.number FROM teams t JOIN team_divisions dt ON t.id = dt.team_id WHERE dt.division_id = %s",
                (str(self.divisionId),),
            )
            teams = cursor.fetchall()
            return [TeamModel(team["id"], team["number"]) for team in teams]

    def get_rooms(self) -> list[LocationModel]:
        with self.pg_conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name FROM judging_rooms WHERE division_id = %s",
                (str(self.divisionId),),
            )
            rooms = cursor.fetchall()
            return [LocationModel(room["id"], room["name"]) for room in rooms]

    def get_tables(self) -> list[LocationModel]:
        with self.pg_conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name FROM robot_game_tables WHERE division_id = %s",
                (str(self.divisionId),),
            )
            tables = cursor.fetchall()
            return [LocationModel(table["id"], table["name"]) for table in tables]

    def get_team(self, team_number: int) -> TeamModel | None:
        with self.pg_conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, number FROM teams WHERE number = %s",
                (team_number,),
            )
            team = cursor.fetchone()
            return TeamModel(team["id"], team["number"]) if team else None

    def get_lems_team_id(self, team_number: int) -> str | None:
        lems_team_id = None
        if team_number is not None:
            team_data = self.get_team(team_number)
            if team_data is not None:
                lems_team_id = team_data.id
        return lems_team_id

    def insert_sessions(self, session_schedule: pd.DataFrame):
        logger.info("Inserting judging sessions into PostgreSQL database")

        sessions_to_insert = []
        ignore_columns = ["start_time", "end_time"]

        for index, row in session_schedule.iterrows():
            scheduled_time = row["start_time"]
            for room_id, _team_number in row[len(ignore_columns) :].items():
                team_number = int(_team_number) if pd.notna(_team_number) else None

                team_id = self.get_lems_team_id(team_number)
                sessions_to_insert.append(
                    {
                        "division_id": str(self.divisionId),
                        "number": index,
                        "room_id": room_id,
                        "team_id": team_id,
                        "scheduled_time": scheduled_time,
                    }
                )

        with self.pg_conn.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO judging_sessions (division_id, number, room_id, team_id, scheduled_time)
                VALUES (%(division_id)s, %(number)s, %(room_id)s, %(team_id)s, %(scheduled_time)s)
                """,
                sessions_to_insert,
            )
            self.pg_conn.commit()

        logger.info(f"Inserted {len(sessions_to_insert)} judging sessions successfully")

    def insert_matches(self, match_schedule: pd.DataFrame):
        raise NotImplementedError("This method is not implemented yet.")

        logger.info("Inserting matches into PostgreSQL database")

        matches_to_insert = []
        match_participants_to_insert = []

        ignore_columns = ["start_time", "end_time", "stage", "round"]
        for index, row in match_schedule.iterrows():
            scheduled_time = row["start_time"]
            stage = row["stage"]
            round_number = row["round"]

            # Insert the match first
            match_data = {
                "division_id": str(self.divisionId),
                "stage": stage,
                "round": round_number,
                "number": index,
                "scheduled_time": scheduled_time,
            }
            matches_to_insert.append(match_data)

            # Collect participants for this match
            for table_id, _team_number in row[len(ignore_columns) :].items():
                team_number = int(_team_number) if pd.notna(_team_number) else None

                team_id = self.get_lems_team_id(team_number)
                if team_id is not None:
                    participant_data = {
                        "match_index": index,  # We'll use this to link back to the match
                        "team_id": team_id,
                        "table_id": table_id,
                        "division_id": str(self.divisionId),
                    }
                    match_participants_to_insert.append(participant_data)

        if matches_to_insert:
            with self.pg_conn.cursor() as cursor:
                cursor.executemany(
                    """
                    INSERT INTO robot_game_matches (division_id, stage, round, number, scheduled_time)
                    VALUES (%(division_id)s, %(stage)s, %(round)s, %(number)s, %(scheduled_time)s)
                    """,
                    matches_to_insert,
                )

                if match_participants_to_insert:
                    cursor.execute(
                        """
                        SELECT id, number FROM robot_game_matches 
                        WHERE division_id = %s AND number = ANY(%s)
                        """,
                        (
                            str(self.divisionId),
                            [m["number"] for m in matches_to_insert],
                        ),
                    )
                    match_id_map = {
                        row["number"]: row["id"] for row in cursor.fetchall()
                    }

                    # Update participant data with actual match IDs
                    for participant in match_participants_to_insert:
                        participant["match_id"] = match_id_map[
                            participant["match_index"]
                        ]
                        del participant["match_index"]  # Remove temporary field

                    cursor.executemany(
                        """
                        INSERT INTO robot_game_match_participants (match_id, team_id, table_id)
                        VALUES (%(match_id)s, %(team_id)s, %(table_id)s)
                        """,
                        match_participants_to_insert,
                    )

                self.pg_conn.commit()

        logger.info(
            f"Inserted {len(matches_to_insert)} matches with {len(match_participants_to_insert)} participants successfully"
        )

    def close_connections(self):
        """Close both PostgreSQL and MongoDB connections"""
        if hasattr(self, "pg_conn"):
            self.pg_conn.close()
            logger.info("PostgreSQL connection closed")
        if hasattr(self, "mongo_client"):
            self.mongo_client.close()
            logger.info("MongoDB connection closed")
