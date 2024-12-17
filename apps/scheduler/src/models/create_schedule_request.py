from pydantic import BaseModel


class Breaks(BaseModel):
    event_type: str
    after: int
    duration_minutes: int


class CreateScheduleRequest(BaseModel):
    disivion_id: str

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
m
    stagger_matches: bool = True

    breaks: list[Breaks]
