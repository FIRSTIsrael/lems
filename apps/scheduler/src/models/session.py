import datetime
from dataclasses import dataclass
from typing import List

from models.event_type import EventType


@dataclass
class Session:
    event_type: EventType
    start_time: datetime
    end_time: datetime
    event_index: int
    session_index: int
    team_number: int
    rejected_teams: List[int]
