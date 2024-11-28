from pymongo import MongoClient


class LemsRepository:
    def __init__(self):
        connection_string = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        self.client = MongoClient(
            connection_string,
            tlsAllowInvalidCertificates=os.getenv("NODE_ENV") == "production",
        )
        self.db = self.client["lems"]
        print(f"🔗 Connecting to MongoDB server at {connection_string}")
        try:
            self.client.admin.command("ping")
            print("🚀 MongoDB Client connected.")
        except Exception as err:
            print("❌ Unable to connect to mongodb: ", err)

    def get_teams(self):
        pass
