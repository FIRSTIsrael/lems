from datetime import datetime
from typing import List, Tuple
import random

from ..models.slot import Slot
from ..models.team import Team
from ..models.session import Session
from ..repository.lems_repository import LemsRepository


def get_random_team(team_options: List[Team]) -> Team:
    return team_options[random.randint(0, len(team_options) - 1)]


def get_teams_not_in_event(teams: List[Team], slot_id: int) -> List[Team]:
    teams_not_in_event = []

    for team in teams:
        team_events = team.team_events
        for event in team_events:
            if event.slot_number == slot_id:
                continue
            teams_not_in_event.append(team)

    return teams_not_in_event


class SchedulerService:
    def __init__(self, teams: List[Team], slots: List[Slot]):
        self.lems_repository = LemsRepository()
        self.teams = teams
        self.slots_left = slots

    def create_schedule(self) -> Tuple[List[Team], List[Slot]]:
        completed_slots = []

        while len(self.slots_left) > 0:
            current_slot = self.slots_left[0]
            team = get_random_team(self.teams)

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

    def get_event_time(self, slot: Slot) -> Tuple[datetime, datetime]:
        pass
