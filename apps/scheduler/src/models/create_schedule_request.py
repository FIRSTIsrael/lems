from pydantic import BaseModel

class EventRequest(BaseModel):
    event_type: str
    start_time: str


class CreateScheduleRequest(BaseModel):
    disivion_id: str

    tables: int
    judging_rooms: int

    judging_session_length_seconds: int
    judging_cycle_time_seconds: int
    match_length_seconds: int
    practice_match_cycle_time_seconds: int
    ranking_match_cycle_time_seconds: int

    stagger_matches: bool = True

    events: list[EventRequest]