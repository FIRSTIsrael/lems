import logging
from copy import deepcopy

from events.event import Event, MAX_MINUTES
from events.judging_session import JudgingSession
from events.practice_match import PracticeMatch
from events.ranking_match import Match
from exceptions.scheduler_error import SchedulerError
from models.create_schedule_request import CreateScheduleRequest, Break
from models.team import Team
from models.team_activity import ActivityType, TeamActivity
from models.location import Location
from services.gale_shapley_service import (
    gale_shapley,
    team_minimum_delta,
)
from repository.lems_repository import LemsRepository

MIN_RUNS = 10
MAX_RUNS = 1000
MIN_SCORE = 15

SECONDS_PER_MINUTE = 60

logger = logging.getLogger("lems.scheduler")


def check_score(teams: list[Team]) -> int:
    """Checks the quality of the schedule by finding the minimum delta between the
    start times of the events for a team. Higher scores are better."""
    min_score = MAX_MINUTES
    total_score = 0

    for team in teams:
        current_score = team_minimum_delta(team.team_events)
        total_score += current_score
        if current_score < min_score:
            min_score = current_score

    return min_score, total_score / len(teams)


class SchedulerService:
    def __init__(self, lems_repository: LemsRepository):
        self.lems_repository = lems_repository

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

        for _ in range(0, create_schedule_request.practice_rounds):
            events.append(
                self.create_event(
                    create_schedule_request, "practice", team_count, event_index
                )
            )
            event_index += 1

        for _ in range(0, create_schedule_request.ranking_rounds):
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
        index: int,
    ) -> Event:
        logger.info(
            f"Creating event of type: {event_type} with index: {index} with {len(create_schedule_request.breaks)} breaks"
        )
        match event_type:
            case "practice":
                tables = self.get_tables()
                return PracticeMatch(
                    activity_length=create_schedule_request.match_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.practice_match_cycle_time_seconds
                        - create_schedule_request.match_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=len(tables),
                    event_index=index,
                    locations=tables,
                    breaks=create_schedule_request.breaks,
                )
            case "ranking":
                tables = self.get_tables()
                return Match(
                    activity_length=create_schedule_request.match_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.ranking_match_cycle_time_seconds
                        - create_schedule_request.match_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=len(tables),
                    event_index=index,
                    locations=tables,
                    breaks=create_schedule_request.breaks,
                )
            case "judging":
                rooms = self.get_rooms()
                return JudgingSession(
                    activity_length=create_schedule_request.judging_session_length_seconds
                    / SECONDS_PER_MINUTE,
                    wait_time_minutes=(
                        create_schedule_request.judging_cycle_time_seconds
                        - create_schedule_request.judging_session_length_seconds
                    )
                    / SECONDS_PER_MINUTE,
                    total_count=team_count,
                    parallel_activities=len(rooms),
                    event_index=index,
                    locations=rooms,
                    breaks=create_schedule_request.breaks,
                )
            case _:
                raise SchedulerError(f"Invalid event type")

    def create_activities(
        self, events: list[Event], create_schedule_request: CreateScheduleRequest
    ) -> list[TeamActivity]:
        activities: list[TeamActivity] = []
        current_matches_start_time = create_schedule_request.matches_start
        current_match_number = 0

        for event in events:
            if event.activity_type() in [
                ActivityType.RANKING_MATCH,
                ActivityType.PRACTICE_MATCH,
            ]:
                new_activities = event.create_activities(
                    current_matches_start_time, current_match_number + 1
                )

                activities += new_activities
                for activity in activities:
                    if activity.number > current_match_number:
                        current_match_number = activity.number
                    if activity.end_time > current_matches_start_time:
                        current_matches_start_time = activity.end_time
            else:
                activities += event.create_activities(
                    create_schedule_request.judging_start
                )

        return activities

    def create_schedule(self, create_schedule_request: CreateScheduleRequest) -> None:
        teams = self.get_teams()
        events = self.create_events(create_schedule_request, len(teams))
        activities = self.create_activities(events, create_schedule_request)

        current_score = 0
        current_run = 0
        best_activities = []

        while current_run < MAX_RUNS:
            current_run += 1

            logger.debug(f"Starting Gale-Shapley run number: {current_run}")

            current_teams = deepcopy(teams)
            current_activities = deepcopy(activities)

            number_of_events = (
                create_schedule_request.ranking_rounds
                + create_schedule_request.practice_rounds
                + 1
            )
            matched_teams, matched_activities = gale_shapley(
                current_teams, current_activities, number_of_events
            )

            score, avg_score = check_score(matched_teams)
            logger.debug(
                f"Score for run {current_run}: min - {score}, avg - {avg_score}"
            )

            if score > current_score:
                current_score = score
                current_average_score = avg_score
                best_activities = matched_activities

            if current_score >= MIN_SCORE and current_run > MIN_RUNS:
                break

        if current_score < MIN_SCORE:
            raise SchedulerError(
                "Failed to generate valid schedule after mulitple attmepts"
            )

        logger.info(
            f"Inserting schedule into LEMS database with score of {current_score} and avg of: {current_average_score}"
        )
        self.lems_repository.insert_schedule(best_activities)
