from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from typing import List

from models.team_activity import TeamActivity, ActivityType
from models.team import Team


MAX_MINUTES = 1440
MINUTES_PER_HOUR = 60
TEAM_MIN_WAIT_TIME = 15


def team_minimum_delta(sessions: List[TeamActivity]) -> int:
    """
    Calculate the minimum time between two activities for a team
    """

    minimum_time = MAX_MINUTES
    for first_session in sessions:
        for second_session in sessions:
            if first_session != second_session:
                if (
                    first_session.end_time
                    > second_session.start_time
                    > first_session.start_time
                ):
                    return 0
                current_time_difference = (
                    first_session.end_time - second_session.start_time
                )
                minutes_difference = (
                    current_time_difference.total_seconds() / MINUTES_PER_HOUR
                )
                if 0 < minutes_difference < minimum_time:
                    minimum_time = minutes_difference
    return minimum_time


class Event(ABC):
    def __init__(
        self,
        activity_length: int,
        wait_time_minutes: int,
        start_time: datetime,
        total_count: int,
        parallel_activities: int,
        event_index: int,
    ):
        self.activity_length = activity_length
        self.wait_time_minutes = wait_time_minutes
        self.start_time = start_time
        self.total_count = total_count
        self.parallel_activities = parallel_activities
        self.event_index = event_index

    @staticmethod
    @abstractmethod
    def calculate_preference(session: TeamActivity, team: Team) -> float:
        pass

    @staticmethod
    @abstractmethod
    def activity_type() -> ActivityType:
        pass

    def create_activities(self) -> List[TeamActivity]:
        activities = []
        current_index = 0
        current_time = self.start_time
        end_time = current_time + timedelta(minutes=self.activity_length)

        while len(activities) < self.total_count:
            if current_index == self.parallel_activities:
                current_index = 0
                current_time = end_time + timedelta(minutes=self.wait_time_minutes)
                end_time = current_time + timedelta(minutes=self.activity_length)

            activities.append(
                TeamActivity(
                    self.activity_type(),
                    current_time,
                    end_time,
                    self.event_index,
                    current_index,
                    0,
                    [],
                )
            )
            current_index += 1

        return activities
