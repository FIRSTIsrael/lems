import random

from typing import List

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


MAX_MATCHES_PER_TABLE = 2


class Match(Event):
    @staticmethod
    def check_times_in_table(table_index: int, team_events: List[Session]) -> int:
        count = 0

        for event in team_events:
            if event.event_type == Match.event_type():
                if event.event_index == table_index:
                    count += 1

        return count

    @staticmethod
    def calculate_preference(session: Session, team: Team) -> float:
        if team.team_number in session.rejected_teams:
            return 0

        times_in_table = Match.check_times_in_table(session.event_index, team.team_events)

        if times_in_table == MAX_MATCHES_PER_TABLE:
            return 0

        preference = 1 - random.random()

        return preference / (times_in_table + 1)

    @staticmethod
    def event_type() -> EventType:
        return EventType.MATCH
