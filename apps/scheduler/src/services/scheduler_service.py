from typing import List, Tuple

from bson import ObjectId

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team
from apps.scheduler.src.repository.ilems_repoistory import ILemsRepoistory
from apps.scheduler.src.services.gale_shapley_service import gale_shapley


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


        return gale_shapley(teams, sessions)
