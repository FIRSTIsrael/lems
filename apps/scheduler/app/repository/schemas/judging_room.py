from typing import TypedDict
from bson import ObjectId


class JudgingRoom(TypedDict):
    name: str
    divisionId: ObjectId
