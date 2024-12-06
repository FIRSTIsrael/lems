from dataclasses import dataclass
from typing import List

from models.session import Session


@dataclass
class Team:
    team_number: int
    team_events: List[Session]
