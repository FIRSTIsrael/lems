from datetime import datetime
from dataclasses import dataclass
from enum import StrEnum


class ActivityType(StrEnum):
    PRACTICE_MATCH = "PRACTICE_MATCH"
    RANKING_MATCH = "RANKING_MATCH"
    JUDGING_SESSION = "JUDGING_SESSION"


@dataclass
class TeamActivity:
    activity_type: ActivityType
    start_time: datetime
    end_time: datetime
    event_index: int
    session_index: int
    team_number: int
    rejected_team_numbers: list[int]
