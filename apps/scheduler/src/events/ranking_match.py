import random

from events.event import (
    Event,
    team_minimum_delta,
    TEAM_MIN_WAIT_TIME,
)
from models.team_activity import TeamActivity, ActivityType
from models.team import Team


MAX_MATCHES_PER_TABLE = 2


class Match(Event):
    @staticmethod
    def check_times_in_table(table_index: int, team_events: list[TeamActivity]) -> int:
        count = 0

        for session in team_events:
            if session.activity_type == Match.activity_type():
                if session.index == table_index:
                    count += 1

        return count

    @staticmethod
    def calculate_preference(session: TeamActivity, team: Team) -> float:
        if team.team_number in session.rejected_team_numbers:
            return 0

        new_sessions = team.team_events.copy()
        new_sessions.append(session)
        if team_minimum_delta(new_sessions) < TEAM_MIN_WAIT_TIME:
            return 0

        times_in_table = Match.check_times_in_table(session.index, team.team_events)

        if times_in_table == MAX_MATCHES_PER_TABLE:
            return 0

        preference = 1 - random.random()

        return preference / (times_in_table + 1)

    @staticmethod
    def activity_type() -> ActivityType:
        return ActivityType.RANKING_MATCH
    
    @staticmethod
    def should_stagger():
        return True
