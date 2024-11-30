from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from typing import List

from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


class Event(ABC):
    def __init__(self, session_length: int, wait_time: int, start_time: datetime, total_count: int, parallel_sessions: int, event_index: int):
        self.session_length = session_length
        self.wait_time = wait_time
        self.start_time = start_time
        self.total_count = total_count
        self.parallel_sessions = parallel_sessions
        self.event_index = event_index

    @staticmethod
    @abstractmethod
    def calculate_preference(session: Session, team: Team) -> float:
        pass

    @staticmethod
    @abstractmethod
    def event_type() -> EventType:
        pass

    def create_sessions(self) -> List[Session]:
        sessions = []
        current_index = 0
        current_time = self.start_time
        end_time = current_time + timedelta(minutes=self.session_length)

        while len(sessions) < self.total_count:
            if current_index == self.parallel_sessions:
                current_index = 0
                current_time = end_time + timedelta(minutes=self.wait_time)
                end_time = current_time + timedelta(minutes=self.session_length)

            sessions.append(Session(self.event_type(), current_time, end_time, self.event_index, current_index, 0, []))
            current_index += 1

        return sessions
