import random

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


class JudgingRoom(Event):
    @staticmethod
    def calculate_preference(session: Session, team: Team) -> float:
        if team.team_number in session.rejected_teams:
            return 0

        return 1 - random.random()

    @staticmethod
    def event_type() -> EventType:
        return EventType.JUDGING_ROOM
