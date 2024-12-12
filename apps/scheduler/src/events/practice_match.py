import random

from events.event import (
    Event,
    team_minimum_delta,
    TEAM_MIN_WAIT_TIME,
)
from models.team_activity import TeamActivity, ActivityType
from models.team import Team


class PracticeMatch(Event):
    @staticmethod
    def calculate_preference(session: TeamActivity, team: Team) -> float:
        if team.team_number in session.rejected_team_numbers:
            return 0

        new_sessions = team.team_events.copy()
        new_sessions.append(session)
        if team_minimum_delta(new_sessions) < TEAM_MIN_WAIT_TIME:
            return 0

        return 1 - random.random()

    @staticmethod
    def activity_type() -> ActivityType:
        return ActivityType.PRACTICE_MATCH
    
    @staticmethod
    def should_stagger():
        return True
    