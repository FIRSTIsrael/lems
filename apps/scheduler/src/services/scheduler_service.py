from bson import ObjectId

from events.event import Event, MAX_MINUTES
from models.team import Team
from models.team_activity import TeamActivity
from services.gale_shapley_service import (
    gale_shapley,
    team_minimum_delta,
)
from repository.lems_repository import LemsRepository


def check_score(teams: list[Team]) -> int:
    min_score = MAX_MINUTES
    for team in teams:
        current_score = team_minimum_delta(team.team_events)
        if current_score < min_score:
            min_score = current_score

    return min_score


class SchedulerService:
    def __init__(self, events: list[Event], lems_repository: LemsRepository):
        self.lems_repository = lems_repository
        self.events = events

    def create_schedule(
        self, division_id: ObjectId
    ) -> tuple[list[Team], list[TeamActivity]]:
        teams = self.lems_repository.get_teams(division_id)
        if len(teams) == 0:
            raise SchedulerError("No teams found for division")

        sessions = []
        for event in self.events:
            sessions += event.create_activities()

        matched_teams, matched_sessions = gale_shapley(teams.copy(), sessions.copy())
        return matched_teams, matched_sessions


class SchedulerError(Exception):
    pass
