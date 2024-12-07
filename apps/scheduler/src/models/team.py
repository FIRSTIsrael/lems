from dataclasses import dataclass
from typing import List

from models.activity import TeamActivity


@dataclass
class Team:
    team_number: int
    team_events: List[TeamActivity]
