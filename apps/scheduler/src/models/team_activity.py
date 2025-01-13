from datetime import datetime
from dataclasses import dataclass
from enum import StrEnum

from models.location import Location


class ActivityType(StrEnum):
    PRACTICE_MATCH = "PRACTICE_MATCH"
    RANKING_MATCH = "RANKING_MATCH"
    JUDGING_SESSION = "JUDGING_SESSION"


@dataclass
class TeamActivity:
    team_number: int
    activity_type: ActivityType
    start_time: datetime
    end_time: datetime
    location: Location
    index: int # Internal identifier for the activity. Not saved to DB. (number)
    event_index: int # Internal identifier for a round. Not saved to DB. (round)
    round: int # Round number to save in DB. Currently only used for matches.
    number: int # Match/session number to save to DB.
    rejected_team_numbers: list[int]
    location: Location