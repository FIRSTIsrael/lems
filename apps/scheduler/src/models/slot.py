from dataclasses import dataclass
from typing import List

from models.team_activity import TeamActivity, ActivityType


@dataclass
class Slot:
    name: str
    event_type: ActivityType
    slot: int
    max_team_events: int
    team_events: List[TeamActivity]
