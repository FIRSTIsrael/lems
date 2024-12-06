from dataclasses import dataclass
from typing import List

from models.event_type import EventType
from models.session import Session


@dataclass
class Slot:
    name: str
    event_type: EventType
    slot: int
    max_team_events: int
    team_events: List[Session]
