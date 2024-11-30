from typing import List, Tuple

from bson import ObjectId

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team
from apps.scheduler.src.repository.ilems_repoistory import ILemsRepoistory
from apps.scheduler.src.services.gale_shapley_service import gale_shapley, team_minimum_time


def chcek_score(teams: List[Team]) -> int:
    min_score = 120
    for team in teams:
        print(team.team_number)
        current_score = team_minimum_time(team.team_events)
        print(current_score)
        if current_score < min_score:
            min_score = current_score

    return min_score

class SchedulerService:
    def __init__(self, events: List[Event], lems_repository: ILemsRepoistory):
        self.lems_repository = lems_repository
        self.events = events

    def create_schedule(self, division_id: ObjectId) -> Tuple[List[Team], List[Session]]:
        sessions = []
        for event in self.events:
            sessions += event.create_sessions()

        teams = self.lems_repository.get_teams(division_id)

        if type(teams[0]) is not Team:
            teams = [Team(team.number, []) for team in teams]


        matched_teams, matched_sessions = gale_shapley(teams.copy(), sessions.copy())

        print(chcek_score(matched_teams))

        return matched_teams, matched_sessions
