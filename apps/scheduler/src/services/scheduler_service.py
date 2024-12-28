from datetime import datetime
from bson import ObjectId

from events.event import Event, MAX_MINUTES
from events.judging_session import JudgingSession
from events.practice_match import PracticeMatch
from events.ranking_match import Match
from exceptions.scheduler_error import SchedulerError
from models.create_schedule_request import CreateScheduleRequest, Breaks
from models.team import Team
from models.team_activity import TeamActivity
from models.location import Location
from services.gale_shapley_service import (
    gale_shapley,
    team_minimum_delta,
)
from repository.lems_repository import LemsRepository

MIN_RUNS = 1
MAX_RUNS = 1
MIN_SCORE = 10

SECONDS_PER_MINUTE = 60


def check_score(teams: list[Team]) -> int:
    """Checks the quality of the schedule by finding the minimum delta between the
    start times of the events for a team. Higher scores are better."""
    min_score = MAX_MINUTES

    for team in teams:
        current_score = team_minimum_delta(team.team_events)
        print(f"Team {team.team_number} has a score of {current_score}")
        if current_score < min_score:
            min_score = current_score

    return min_score


class SchedulerService:
    def __init__(self, lems_repository: LemsRepository):
        self.lems_repository = lems_repository
        self.match_number = 0

    def get_teams(self) -> list[Team]:
        teams = []

        try:
            teams = self.lems_repository.get_teams()
        except:
            raise SchedulerError("Failed to connect to MongoDB")

        if len(teams) == 0:
            raise SchedulerError("No teams found for division")

        return teams

    def get_rooms(self) -> list[Location]:
        try:
            return self.lems_repository.get_rooms()
        except:
            raise SchedulerError("Failed to retrieve rooms from DB")

    def get_tables(self) -> list[Location]:
        try:
            return self.lems_repository.get_tables()
        except:
            raise SchedulerError("Failed to retrieve tables from DB")

    def create_events(
        self, create_schedule_request: CreateScheduleRequest, team_count: int
    ) -> list[Event]:
        events = []
        event_index = 0

        for _ in range(0, create_schedule_request.practice_matches_count):
            events.append(
                self.create_event(
                    create_schedule_request, "practice", team_count, event_index
                )
            )
            event_index += 1

        for _ in range(0, create_schedule_request.ranking_matches_count):
            events.append(
                self.create_event(
                    create_schedule_request, "ranking", team_count, event_index
                )
            )
            event_index += 1

        events.append(
            self.create_event(
                create_schedule_request, "judging", team_count, event_index
            )
        )

        return events

    def create_event(
        self,
        create_schedule_request: CreateScheduleRequest,
        event_type: str,
        team_count: int,
        index: int
    ) -> Event:
        match event_type:
            case "practice":
                return PracticeMatch(
                    activity_length=create_schedule_request.match_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.practice_match_cycle_time_seconds
                        - create_schedule_request.match_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=create_schedule_request.tables,
                    event_index=index,
                    locations=self.get_tables(),
                    breaks=create_schedule_request.breaks,
                )
            case "ranking":
                return Match(
                    activity_length=create_schedule_request.match_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.ranking_match_cycle_time_seconds
                        - create_schedule_request.match_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=create_schedule_request.tables,
                    event_index=index,
                    locations=self.get_tables(),
                    breaks=create_schedule_request.breaks,
                )
            case "judging":
                return JudgingSession(
                    activity_length=create_schedule_request.judging_session_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.judging_cycle_time_seconds
                        - create_schedule_request.judging_session_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=create_schedule_request.judging_rooms,
                    event_index=index,
                    locations=self.get_rooms(),
                    breaks=create_schedule_request.breaks,
                )
            case _:
                raise SchedulerError(f"Invalid event type")

    def create_activities(
        self, team_count: int, events: list[Event], create_schedule_request: CreateScheduleRequest
    ) -> list[TeamActivity]:
        activities = []

        current_matches_start_time = create_schedule_request.matches_start

        for event in events:
            if event.activity_type() in ["ranking", "practice"]:
                activities += event.create_activities(team_count, current_matches_start_time, self.match_number)
                for activity in activities:
                    if activity.number > self.match_number:
                        self.match_number = activity.number
                    if activity.end_time > current_matches_start_time:
                        current_matches_start_time = activity.end_time
            else:
                activities += event.create_activities(team_count, create_schedule_request.judging_start)

        return activities

    def create_schedule(self, create_schedule_request: CreateScheduleRequest) -> None:
        teams = self.get_teams()

        events = self.create_events(create_schedule_request, len(teams))
        activities = self.create_activities(len(teams), events, create_schedule_request)

        print(f"Created {len(activities)} activities for {len(teams)} teams")

        current_score = 0
        current_run = 0
        best_activities = []

        while current_run < MAX_RUNS and not (
            current_score >= MIN_SCORE and current_run > MIN_RUNS
        ):
            current_run += 1

            print(f"Starting Gale-Shapley run number: {current_run}")

            current_teams = self.get_teams()
            current_activities = self.create_activities(len(teams), events, create_schedule_request)

            matched_teams, matched_activities = gale_shapley(
                current_teams, current_activities
            )

            score = check_score(matched_teams)
            print(f"Score for run {current_run}: {score}")

            if score > current_score:
                current_score = score
                best_activities = matched_activities

        if score < MIN_SCORE:
            raise SchedulerError(
                "Failed to generate valid schedule after mulitple attmepts"
            )

        self.lems_repository.insert_schedule(best_activities)