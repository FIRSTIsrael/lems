from dataclasses import dataclass
from bson import ObjectId

from models.team_activity import TeamActivity


@dataclass
class Team:
    id: ObjectId
    team_number: int
    team_events: list[TeamActivity]
