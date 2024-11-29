from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from typing import List

from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


class Event(ABC):
    def __init__(self, session_length: int, start_time: datetime):
        self.session_length = session_length
        self.start_time = start_time

    @staticmethod
    @abstractmethod
    def calculate_preference(session: Session, team: Team) -> float:
        pass

    @staticmethod
    @abstractmethod
    def event_type() -> EventType:
        pass

    def create_sessions(self, total_count: int, parallel_sessions: int, event_index: int) -> List[Session]:
        sessions = []
        current_index = 0
        current_time = self.start_time
        end_time = current_time + timedelta(minutes=self.session_length)

        while len(sessions) < total_count:
            if current_index == parallel_sessions:
                current_index = 0
                current_time = end_time
                end_time += timedelta(minutes=self.session_length)

            sessions.append(Session(self.event_type(), current_time, end_time, event_index, current_index, 0, []))
            current_index += 1

        return sessions
