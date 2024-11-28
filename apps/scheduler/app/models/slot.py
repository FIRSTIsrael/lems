from dataclasses import dataclass
from typing import List

from apps.scheduler.app.modles.event_type import EventType
from apps.scheduler.app.modles.team_event import TeamEvent


@dataclass
class Slot:
  name: str
  event_type: EventType
  slot: int
  max_team_events: int
  team_events: List[TeamEvent]
