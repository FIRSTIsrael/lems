from typing import List, Tuple

from bson import ObjectId

from events.event import Event, MAX_MINUTES
from models.team import Team
from models.session import Session
from services.gale_shapley_service import gale_shapley, team_minimum_time
from repository.lems_repository import LemsRepository


def chcek_score(teams: List[Team]) -> int:
    min_score = MAX_MINUTES
    for team in teams:
        current_score = team_minimum_time(team.team_events)
        if current_score < min_score:
            min_score = current_score

    return min_score


class SchedulerService:
    def __init__(self, events: List[Event], lems_repository: LemsRepository):
        self.lems_repository = lems_repository
        self.events = events

    def create_schedule(
        self, division_id: ObjectId
    ) -> Tuple[List[Team], List[Session]]:
        sessions = []
        for event in self.events:
            sessions += event.create_sessions()

        teams = self.lems_repository.get_teams(division_id)

        if type(teams[0]) is not Team:
            teams = [Team(team.number, []) for team in teams]

        matched_teams, matched_sessions = gale_shapley(teams.copy(), sessions.copy())

        return matched_teams, matched_sessions
