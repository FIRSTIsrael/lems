from typing import Literal
from datetime import datetime
from pydantic import BaseModel


class Break(BaseModel):
    event_type: Literal["judging", "match"]
    after: int
    duration_seconds: int


class CreateScheduleRequest(BaseModel):
    division_id: str

    matches_start: datetime
    practice_rounds: int
    ranking_rounds: int
    match_length_seconds: int
    practice_match_cycle_time_seconds: int
    ranking_match_cycle_time_seconds: int

    stagger_matches: bool = True

    judging_start: datetime
    judging_session_length_seconds: int
    judging_cycle_time_seconds: int

    breaks: list[Break]
