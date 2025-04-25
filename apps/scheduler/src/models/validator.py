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


class OverlappingRound(TypedDict):
    stage: Literal["practice", "ranking"]
    number: int
    start_time: datetime
    end_time: datetime
    available_matches: list[ValidatorMatch]


class ValidatorData(TypedDict):
    session: ValidatorSession
    overlapping_rounds: list[OverlappingRound]


class ValidatorError(Exception):
    def __init__(self, message: str, data: list[ValidatorData], *args):
        super().__init__(message, *args)
        self.data = data
