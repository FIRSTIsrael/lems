from bson import ObjectId
from typing import TypedDict


class RobotGameTable(TypedDict):
    name: str
    divisionId: ObjectId
