import random

from apps.scheduler.src.events.event import Event, team_minimum_time, TEAM_MIN_WAIT_TIME
from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


class JudgingRoom(Event):
    @staticmethod
    def calculate_preference(session: Session, team: Team) -> float:
        if team.team_number in session.rejected_teams:
            return 0

        new_sessions = team.team_events.copy()
        new_sessions.append(session)
        if team_minimum_time(new_sessions) < TEAM_MIN_WAIT_TIME:
            return 0

        return 1 - random.random()

    @staticmethod
    def event_type() -> EventType:
        return EventType.JUDGING_ROOM
