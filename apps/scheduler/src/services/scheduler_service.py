from datetime import datetime
from bson import ObjectId

from events.event import Event, MAX_MINUTES
from events.judging_session import JudgingSession
from events.practice_match import PracticeMatch
from events.ranking_match import Match
from exceptions.scheduler_error import SchedulerError
from models.create_schedule_request import CreateScheduleRequest, EventRequest
from models.team import Team
from models.team_activity import TeamActivity
from services.gale_shapley_service import (
    gale_shapley,
    team_minimum_delta,
)
from repository.lems_repository import LemsRepository

MIN_RUNS = 25
MAX_RUNS = 100
MIN_SCORE = 40

SECONDS_PER_MINUTE = 60

def create_event(create_schedule_request: CreateScheduleRequest, event_request: EventRequest, team_count: int, index: int) -> Event:
    match event_request.event_type:
        case "practice":
            return PracticeMatch(
                create_schedule_request.match_length_seconds / SECONDS_PER_MINUTE,
                (create_schedule_request.practice_match_cycle_time_seconds - create_schedule_request.match_length_seconds) / SECONDS_PER_MINUTE,
                datetime.strptime(event_request.start_time),
                team_count,
                create_schedule_request.tables,
                index
            )
        case "ranking":
            return Match(
                create_schedule_request.match_length_seconds / SECONDS_PER_MINUTE,
                (create_schedule_request.ranking_match_cycle_time_seconds - create_schedule_request.match_length_seconds) / SECONDS_PER_MINUTE,
                datetime.strptime(event_request.start_time),
                team_count,
                create_schedule_request.tables,
                index
            )
        case "judging":
            return JudgingSession(
                create_schedule_request.judging_session_length_seconds / SECONDS_PER_MINUTE,
                (create_schedule_request.judging_cycle_time_seconds - create_schedule_request.judging_session_length_seconds) / SECONDS_PER_MINUTE,
                datetime.strptime(event_request.start_time),
                team_count,
                create_schedule_request.judging_rooms,
                index
            )
        case _:
            raise SchedulerError(f"Invalid event type: {event_request.event_type}")


def create_events(create_schedule_request: CreateScheduleRequest, team_count: int) -> list[Event]:
    events = []
    event_count = 0

    for event_request in create_schedule_request.events:
        events.append(create_event(create_schedule_request, event_request, team_count, event_count))
        event_count += 1

    return events


def create_activities(events: list[Event]) -> list[TeamActivity]:
    activities = []

    for event in events:
        activities += event.create_activities()

    return activities


def check_score(teams: list[Team]) -> int:
    min_score = MAX_MINUTES
    for team in teams:
        current_score = team_minimum_delta(team.team_events)
        if current_score < min_score:
            min_score = current_score

    return min_score


class SchedulerService:
    def __init__(self, lems_repository: LemsRepository):
        self.lems_repository = lems_repository

    def get_teams(self, division_id: ObjectId) -> list[Team]:
        teams = []

        try:
            teams = self.lems_repository.get_teams(division_id)
        except:
            raise SchedulerError("Failed to connect to MongoDB")

        if len(teams) == 0:
            raise SchedulerError("No teams found for division")
        
        return teams

    def create_schedule(self, create_schedule_request: CreateScheduleRequest) -> None:
        teams = self.get_teams(create_schedule_request.disivion_id)
        events = create_events(create_schedule_request, len(teams))
        activities = create_activities(events)

        current_score = 0
        current_run = 0
        best_activities = []

        while current_run < MAX_RUNS and not (current_score >= MIN_SCORE and current_run > MIN_RUNS):
            current_run += 1

            matched_teams, matched_activities = gale_shapley(teams.copy(), activities.copy())

            score = check_score(matched_teams)
            if score > current_score:
                current_score = score
                best_activities = matched_activities
        
        if score < MIN_SCORE:
            raise SchedulerError("Failed to generate valid schedule after mulitple attmepts")
        
        self.lems_repository.insert_schedule(best_activities)
