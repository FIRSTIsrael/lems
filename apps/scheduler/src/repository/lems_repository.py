import os
import logging
from bson import ObjectId
from typing import Literal

from pymongo import MongoClient
from pymongo.collection import Collection

from models.team import Team as TeamModel
from models.team_activity import TeamActivity, ActivityType
from models.location import Location as LocationModel
from repository.schemas.team import Team
from repository.schemas.judging_session import JudgingSession
from repository.schemas.robot_game_match import RobotGameMatch
from repository.schemas.judging_room import JudgingRoom
from repository.schemas.robot_game_table import RobotGameTable

logger = logging.getLogger(__name__)


class LemsRepository:
    def __init__(self, divisionId: ObjectId):
        connection_string = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        self.divisionId = ObjectId(divisionId)
        self.client = MongoClient(
            connection_string,
            tls=False,  # TODO: fix this
            # tlsAllowInvalidCertificates=os.getenv("PYTHON_ENV") == "production",
        )
        self.db = self.client["lems"]
        print(f"🔗 Connecting to MongoDB server at {connection_string}")
        try:
            self.client.admin.command("ping")
            print("🚀 MongoDB Client connected.")
        except Exception as err:
            print("❌ Unable to connect to mongodb: ", err)

    def get_teams(self) -> list[TeamModel]:
        collection: Collection[Team] = self.db.teams
        teams = collection.find({"divisionId": self.divisionId}).to_list()
        return [TeamModel(team.get("_id"), team.get("number"), []) for team in teams]

    def get_rooms(self) -> list[LocationModel]:
        collection: Collection[JudgingRoom] = self.db.rooms
        rooms = collection.find({"divisionId": self.divisionId}).to_list()
        return [LocationModel(room.get("_id"), room.get("name")) for room in rooms]

    def get_tables(self) -> list[LocationModel]:
        collection: Collection[RobotGameTable] = self.db.tables
        tables = collection.find({"divisionId": self.divisionId}).to_list()
        return [LocationModel(table.get("_id"), table.get("name")) for table in tables]

    def get_locations(self) -> list[LocationModel]:
        rooms = self.get_rooms()
        tables = self.get_tables()
        return rooms + tables

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

    def insert_schedule(self, activities: list[TeamActivity]):
        logger.info("Inserting schedule into LEMS database")
        judging_activities = [
            activity
            for activity in activities
            if activity.activity_type == ActivityType.JUDGING_SESSION
        ]

        for activity in judging_activities:
            self.insert_judging_session(activity)

        match_activities = [
            activity
            for activity in activities
            if activity.activity_type == ActivityType.PRACTICE_MATCH
            or activity.activity_type == ActivityType.RANKING_MATCH
        ]

        max_match_number = 0
        for team_match_activity in match_activities:
            if team_match_activity.number > max_match_number:
                max_match_number = team_match_activity.number

        logger.debug(f"Max match number: {max_match_number}")
        for match_index in range(0, max_match_number + 1):
            current_match_activities = [
                activity
                for activity in match_activities
                if activity.number == match_index
            ]

            if current_match_activities[0].activity_type == ActivityType.RANKING_MATCH:
                self.insert_match("ranking", current_match_activities)
            else:
                self.insert_match("practice", current_match_activities)

    def insert_judging_session(self, activity: TeamActivity):
        collection: Collection[JudgingSession] = self.db.sessions
        document: JudgingSession = {
            "divisionId": self.divisionId,
            "number": activity.number,
            "roomId": activity.location.id,
            "teamId": self.get_lems_team_id(activity.team_number),
            "called": False,
            "queued": False,
            "status": "not-started",
            "scheduledTime": activity.start_time,
        }
        collection.insert_one(document)

    def insert_match(
        self,
        stage: Literal["practice", "ranking"],
        activities: list[TeamActivity],
    ):
        participants = []
        for activity in activities:
            participants.append(
                {
                    "teamId": self.get_lems_team_id(activity.team_number),
                    "tableId": activity.location.id,
                    "tableName": activity.location.name,
                    "queued": False,
                    "ready": False,
                    "present": "no-show",
                }
            )

        if len(participants) > 8:
            participants = participants[:8]

        collection: Collection[RobotGameMatch] = self.db.matches
        document: RobotGameMatch = {
            "divisionId": self.divisionId,
            "stage": stage,
            "round": activity.round,
            "number": activity.number,
            "status": "not-started",
            "scheduledTime": activity.start_time,
            "called": False,
            "participants": participants,
        }
        collection.insert_one(document)
