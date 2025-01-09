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
    tables: int
    practice_matches_count: int
    ranking_matches_count: int

    judging_start: datetime
    judging_rooms: int

    judging_session_length_seconds: int
    judging_cycle_time_seconds: int
    match_length_seconds: int
    practice_match_cycle_time_seconds: int
    ranking_match_cycle_time_seconds: int

    stagger_matches: bool = True

    breaks: list[Break]
