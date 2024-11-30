from bson import ObjectId
from typing import List

from apps.scheduler.src.models.team import Team
from apps.scheduler.src.repository.ilems_repoistory import ILemsRepoistory


TEAMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]


class MockLemsRepository(ILemsRepoistory):
    def __init__(self):
        pass

    def get_teams(self, divisionId: ObjectId) -> List[Team]:
        teams = []

        for team in TEAMS:
            teams.append(Team(team, []))

        return teams
