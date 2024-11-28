from typing import TypedDict, Literal
from datetime import datetime
from bson import ObjectId


class JudgingSession(TypedDict):
    divisionId: ObjectId
    number: int
    teamId: ObjectId | None
    roomId: ObjectId
    called: Literal[False]
    queued: Literal[False]
    status: Literal["not-started"]
    scheduledTime: datetime
