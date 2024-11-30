import os
from bson import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection

from .ilems_repoistory import ILemsRepoistory
from ..repository.schemas.team import Team


class LemsRepository(ILemsRepoistory):
    def __init__(self):
        connection_string = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        self.client = MongoClient(
            connection_string,
            tlsAllowInvalidCertificates=os.getenv("PYTHON_ENV") == "production",
        )
        self.db = self.client["lems"]
        print(f"🔗 Connecting to MongoDB server at {connection_string}")
        try:
            self.client.admin.command("ping")
            print("🚀 MongoDB Client connected.")
        except Exception as err:
            print("❌ Unable to connect to mongodb: ", err)

    def get_teams(self, divisionId: ObjectId) -> list[Team]:
        collection: Collection[Team] = self.db.teams
        return collection.find({"divisionId": divisionId}).to_list()
