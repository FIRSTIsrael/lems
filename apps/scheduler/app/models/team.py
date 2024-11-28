from dataclasses import dataclass
from typing import List

from apps.scheduler.app.modles.team_event import TeamEvent


@dataclass
class Team:
  team_number: int
  team_events: List[TeamEvent]
