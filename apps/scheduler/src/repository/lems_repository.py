import os
from bson import ObjectId

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


class LemsRepository:
    def __init__(self, divisionId: ObjectId):
        connection_string = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
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

        self.divisionId = divisionId

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

    def insert_schedule(self, activities: list[TeamActivity]):
        for activity in activities:
            match activity.activity_type:
                case ActivityType.JUDGING_SESSION:
                    self.insert_judging_session(activity)
                case ActivityType.RANKING_MATCH:
                    self.insert_ranking_match(activity)
                case ActivityType.PRACTICE_MATCH:
                    self.insert_practice_match(activity)

    def insert_judging_session(self, activity: TeamActivity):
        collection: Collection[JudgingSession] = self.db.sessions
        document: JudgingSession = {
            "divisionId": self.divisionId,
            "number": activity.index,
            "teamId": self.get_team(activity.team_number)._id,
            "roomId": activity.location.id,
            "called": False,
            "queued": False,
            "status": "not-started",
            "scheduledTime": activity.start_time,
        }
        collection.insert_one(document)

    def insert_ranking_match(self, activity: TeamActivity):
        collection: Collection[RobotGameMatch] = self.db.matches
        document: RobotGameMatch = {
            "divisionId": self.divisionId,
            "number": activity.index,
            "teamId": self.get_team(activity.team_number)._id,
            "tableId": activity.location.id,
            "status": "not-started",
            "scheduledTime": activity.start_time,
        }
        collection.insert_one(document)

    def insert_practice_match(self, activity: TeamActivity):
        collection: Collection[RobotGameMatch] = self.db.matches
        document: RobotGameMatch = {
            "divisionId": self.divisionId,
            "number": activity.index,
            "teamId": self.get_team(activity.team_number)._id,
            "tableId": activity.location.id,
            "status": "not-started",
            "scheduledTime": activity.start_time,
        }
        collection.insert_one(document)
