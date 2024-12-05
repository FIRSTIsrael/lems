from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from typing import List

from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


MAX_MINUTES = 1440
MINUTES_PER_HOUR = 60
TEAM_MIN_WAIT_TIME = 15


def team_minimum_time(sessions: List[Session]) -> int:
    minimum_time = MAX_MINUTES
    for first_session in sessions:
        for second_session in sessions:
            if first_session != second_session:
                if first_session.end_time > second_session.start_time > first_session.start_time:
                    return 0
                current_time_difference = first_session.end_time - second_session.start_time
                minutes_difference = current_time_difference.total_seconds() / MINUTES_PER_HOUR
                if 0 < minutes_difference < minimum_time:
                    minimum_time = minutes_difference
    return minimum_time


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
