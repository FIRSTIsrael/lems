import datetime
from dataclasses import dataclass

from apps.scheduler.app.modles.event_type import EventType


@dataclass
class TeamEvent:
  start_time: datetime
  end_time: datetime
  event_type: EventType
  slot_number: int
  team_number: int
