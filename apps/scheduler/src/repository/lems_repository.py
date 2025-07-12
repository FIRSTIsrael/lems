import os
import logging
from bson import ObjectId
import pandas as pd

from pymongo import MongoClient
from pymongo.collection import Collection

from models.lems import Team as TeamModel, Location as LocationModel

from repository.schemas.judging_session import JudgingSession
from repository.schemas.robot_game_match import RobotGameMatch
from repository.schemas.team import Team
from repository.schemas.judging_room import JudgingRoom
from repository.schemas.robot_game_table import RobotGameTable

logger = logging.getLogger("lems.scheduler")


class LemsRepository:
    def __init__(self, divisionId: ObjectId):
        connection_string = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        self.divisionId = ObjectId(divisionId)
        self.client = MongoClient(
            connection_string, tls=os.getenv("PYTHON_ENV") == 'production', tlsAllowInvalidCertificates=True
        )
        self.db = self.client["lems"]
        logger.info(f"🔗 Connecting to MongoDB server at {connection_string}")
        try:
            self.client.admin.command("ping")
            logger.info("🚀 MongoDB Client connected.")
        except Exception as err:
            logger.error("❌ Unable to connect to mongodb: ", err)

    def get_teams(self) -> list[TeamModel]:
        collection: Collection[Team] = self.db.teams
        teams = collection.find({"divisionId": self.divisionId}).to_list()
        return [TeamModel(team.get("_id"), team.get("number")) for team in teams]

    def get_rooms(self) -> list[LocationModel]:
        collection: Collection[JudgingRoom] = self.db.rooms
        rooms = collection.find({"divisionId": self.divisionId}).to_list()
        return [LocationModel(room.get("_id"), room.get("name")) for room in rooms]

    def get_tables(self) -> list[LocationModel]:
        collection: Collection[RobotGameTable] = self.db.tables
        tables = collection.find({"divisionId": self.divisionId}).to_list()
        return [LocationModel(table.get("_id"), table.get("name")) for table in tables]

    def get_team(self, team_number: int) -> Team:
        collection: Collection[Team] = self.db.teams
        team = collection.find_one(
            {"divisionId": self.divisionId, "number": team_number}
        )
        return team

    def get_lems_team_id(self, team_number: int) -> ObjectId:
        lems_team_id = None
        if team_number is not None:
            object_id = self.get_team(team_number)
            if object_id is not None:
                lems_team_id = ObjectId(object_id["_id"])
        return lems_team_id

    def insert_sessions(self, session_schedule: pd.DataFrame):
        logger.info("Inserting judging sessions into LEMS database")
        collection: Collection[JudgingSession] = self.db.sessions
        sessions: list[JudgingSession] = []

        ignore_columns = ["start_time", "end_time"]
        for index, row in session_schedule.iterrows():
            start_time = row["start_time"]
            for room_id, _team_number in row[len(ignore_columns) :].items():
                team_number = int(_team_number) if pd.notna(_team_number) else None

                lems_team_id = self.get_lems_team_id(team_number)
                if lems_team_id is not None:
                    document: JudgingSession = {
                        "divisionId": self.divisionId,
                        "number": index,
                        "roomId": ObjectId(room_id),
                        "teamId": lems_team_id,
                        "called": False,
                        "queued": False,
                        "status": "not-started",
                        "scheduledTime": start_time,
                    }
                    sessions.append(document)

        collection.insert_many(sessions)
        logger.info("Judging sessions inserted successfully")

    def insert_matches(self, match_schedule: pd.DataFrame):
        logger.info("Inserting matches into LEMS database")
        collection: Collection[RobotGameMatch] = self.db.matches
        matches: list[RobotGameMatch] = []
        tables = self.get_tables()

        ignore_columns = ["start_time", "end_time", "stage", "round"]
        for index, row in match_schedule.iterrows():
            start_time = row["start_time"]
            stage = row["stage"]
            round_number = row["round"]

            participants = []
            for table_id, _team_number in row[len(ignore_columns) :].items():
                team_number = int(_team_number) if pd.notna(_team_number) else None
                table_name = next(
                    (table.name for table in tables if table.id == table_id), None
                )

                lems_team_id = self.get_lems_team_id(team_number)
                if lems_team_id is not None:
                    participants.append(
                        {
                            "teamId": lems_team_id,
                            "tableId": ObjectId(table_id),
                            "tableName": table_name,
                            "queued": False,
                            "ready": False,
                            "present": "no-show",
                        }
                    )

            document: RobotGameMatch = {
                "divisionId": self.divisionId,
                "stage": stage,
                "round": round_number,
                "number": index,
                "status": "not-started",
                "scheduledTime": start_time,
                "called": False,
                "participants": participants,
            }
            matches.append(document)

        collection.insert_many(matches)
        logger.info("Matches inserted successfully")
