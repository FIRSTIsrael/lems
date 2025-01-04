from abc import ABC, abstractmethod
from datetime import datetime, timedelta

from typing import List

from models.create_schedule_request import Breaks
from models.team_activity import TeamActivity, ActivityType
from models.team import Team
from models.location import Location


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
        total_count: int,
        parallel_activities: int,
        event_index: int,
        locations: list[Location],
        breaks: list[Breaks],
    ):
        self.activity_length = activity_length
        self.wait_time_minutes = wait_time_minutes
        self.total_count = total_count
        self.parallel_activities = parallel_activities
        self.event_index = event_index
        self.locations = locations
        self.breaks = list(filter(lambda x: x.event_type == self.activity_type(), breaks))

    @staticmethod
    @abstractmethod
    def calculate_preference(session: TeamActivity, team: Team) -> float:
        pass

    @staticmethod
    @abstractmethod
    def activity_type() -> ActivityType:
        pass

    @staticmethod
    @abstractmethod
    def should_stagger() -> bool:
        pass

    def create_matches(self, start_time: datetime, starting_number: int = 0) -> List[TeamActivity]:
        activities = []
        current_time = start_time
        end_time = current_time + timedelta(minutes=self.activity_length)
        number = starting_number

        cycle_time = self.activity_length + self.wait_time_minutes

        current_break_index = 0
        location_index = 0

        activities_created = 0

        active_parrellel_activities = self.parallel_activities
        if self.should_stagger():
            active_parrellel_activities = (int) (active_parrellel_activities / 2)

        while activities_created < self.total_count:
            break_after = 1000
            break_duration = 0
            if len(self.breaks) > current_break_index:
                current_break = self.breaks[current_break_index]
                break_after = current_break.after
                break_duration = current_break.duration_minutes

            if number == break_after:
                current_time += timedelta(minutes=break_duration)
                end_time += timedelta(minutes=break_duration)
                current_break_index += 1

            current_index = 0

            if self.should_stagger():
                first_team = None
                second_team = -1
                if number % 2 == 1:
                    first_team = -1
                    second_team = None
                
                location_index = 0
                for _ in range(active_parrellel_activities):
                    activities.append(
                        TeamActivity(
                            activity_type=self.activity_type(),
                            start_time=current_time,
                            end_time=end_time,
                            location=self.locations[location_index],
                            index=current_index,
                            event_index=self.event_index,
                            rejected_team_numbers=[],
                            number=number,
                            round=self.event_index,
                            team_number=first_team
                        )
                    )
                    current_index += 1
                    location_index += 1
                for _ in range(active_parrellel_activities):
                    activities.append(
                        TeamActivity(
                            activity_type=self.activity_type(),
                            start_time=current_time,
                            end_time=end_time,
                            location=self.locations[location_index],
                            index=current_index,
                            event_index=self.event_index,
                            rejected_team_numbers=[],
                            number=number,
                            round=self.event_index,
                            team_number=second_team
                        )
                    )
                    current_index += 1
                    location_index += 1
            
            else:
                for _ in range(active_parrellel_activities):
                    activities.append(
                        TeamActivity(
                            activity_type=self.activity_type(),
                            start_time=current_time,
                            end_time=end_time,
                            location=self.locations[location_index],
                            index=current_index,
                            event_index=self.event_index,
                            rejected_team_numbers=[],
                            number=number,
                            round=self.event_index,
                            team_number=None
                        )
                    )
                    current_index += 1
                    location_index += 1
            
            number += 1
            current_time += timedelta(minutes=cycle_time)
            end_time += timedelta(minutes=cycle_time)
            activities_created += active_parrellel_activities

        return activities

    def create_activities(
        self, start_time: datetime, starting_number: int = 0
    ) -> List[TeamActivity]:
        if self.activity_type() in [ActivityType.RANKING_MATCH, ActivityType.PRACTICE_MATCH]:
            return self.create_matches(start_time, starting_number)
        
        activities = []
        current_index = 0
        current_time = start_time
        end_time = current_time + timedelta(minutes=self.activity_length)
        number = starting_number

        cycle_time = self.activity_length + self.wait_time_minutes

        while len(activities) < self.total_count:
            if current_index == self.parallel_activities:
                current_index = 0
                current_time += timedelta(minutes=cycle_time)
                end_time += timedelta(minutes=cycle_time)

            activities.append(
                TeamActivity(
                    activity_type=self.activity_type(),
                    start_time=current_time,
                    end_time=end_time,
                    location=self.locations[current_index],
                    index=current_index,
                    event_index=self.event_index,
                    rejected_team_numbers=[],
                    number=number,
                    round=self.event_index,
                    team_number=None
                )
            )
            number += 1
            current_index += 1

        return activities
