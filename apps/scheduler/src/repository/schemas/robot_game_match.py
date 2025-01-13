from datetime import datetime
from typing import TypedDict, Literal
from bson import ObjectId


class RobotGameMatchParticipant(TypedDict):
    teamId: ObjectId | None
    tableId: ObjectId
    tableName: str
    queued: Literal[False]
    ready: Literal[False]
    present: Literal["no-show"]


class RobotGameMatch(TypedDict):
    divisionId: ObjectId
    round: int
    number: int
    stage: Literal["practice", "ranking"]
    called: Literal[False]
    status: Literal["not-started"]
    scheduledTime: datetime
    participants: list[RobotGameMatchParticipant]
