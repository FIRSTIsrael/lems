from datetime import datetime
from typing import List, Tuple
import random

from apps.scheduler.app.models.slot import Slot
from apps.scheduler.app.models.team import Team
from apps.scheduler.app.models.team_event import TeamEvent
from apps.scheduler.app.repository.lems_repository import LemsRepository


def get_random_team(team_options: List[Team]) -> Team:
    return team_options[random.randint(0, len(team_options) - 1)]


class SchedulerService:
    def __init__(self, teams: List[Team], slots: List[Slot]):
        self.lems_repository = LemsRepository()
        self.teams = teams
        self.slots_left = slots

    def create_schedule(self) -> Tuple[List[Team], List[Slot]]:
        completed_slots = []

        while len(self.slots_left) > 0:
            current_slot = self.slots_left[0]
            team_options = self.get_valid_teams(current_slot)
            team = get_random_team(team_options)

            if self.team_prefers(team, current_slot):
                start_time, end_time = self.get_event_time(current_slot)
                team_event = TeamEvent(
                    start_time,
                    end_time,
                    current_slot.event_type,
                    current_slot.slot,
                    team.team_number,
                )
                team.team_events.append(team_event)
                current_slot.team_events.append(team_event)

                if len(current_slot.team_events) == current_slot.max_team_events:
                    completed_slots.append(current_slot)
                    self.slots_left.remove(current_slot)

        return self.teams, completed_slots

    def get_valid_teams(self, slot: Slot) -> List[Team]:
        pass

    def team_prefers(self, team: Team, slot: Slot) -> bool:
        pass

    def get_event_time(self, slot: Slot) -> Tuple[datetime, datetime]:
        pass
