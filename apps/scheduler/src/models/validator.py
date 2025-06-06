from typing import TypedDict, Literal
from datetime import datetime


class ValidatorEvent(TypedDict):
    event_type: Literal["match", "judging"]
    number: int
    slots: int
    start_time: datetime
    end_time: datetime


class ValidatorSession(ValidatorEvent):
    event_type: Literal["judging"]


class ValidatorMatch(ValidatorEvent):
    event_type: Literal["match"]
    stage: Literal["practice", "ranking"]
    round: int


class OverlappingRound(TypedDict):
    stage: Literal["practice", "ranking"]
    number: int
    start_time: datetime
    end_time: datetime
    available_matches: list[ValidatorMatch]


class ValidatorData(TypedDict):
    session: ValidatorSession
    overlapping_rounds: list[OverlappingRound]
