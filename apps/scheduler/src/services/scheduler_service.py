from typing import List, Tuple

from bson import ObjectId

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team
from apps.scheduler.src.repository.lems_repository import LemsRepository
from apps.scheduler.src.services.gale_shapley_service import gale_shapley


class SchedulerService:
    def __init__(self, events: List[Event], lems_repository: LemsRepository):
        self.lems_repository = lems_repository
        self.events = events

    def create_schedule(self, division_id: ObjectId) -> Tuple[List[Team], List[Session]]:
        sessions = []
        for event in self.events:
            sessions += event.create_sessions()

        lems_teams = self.lems_repository.get_teams(division_id)
        teams = [Team(team.number, []) for team in lems_teams]

        return gale_shapley(teams, sessions)
