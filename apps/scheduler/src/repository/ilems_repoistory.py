from abc import ABC, abstractmethod

from bson import ObjectId
from typing import List

from apps.scheduler.src.repository.schemas.team import Team


class ILemsRepoistory(ABC):
    @abstractmethod
    def get_teams(self, divisionId: ObjectId) -> List[Team]:
        pass
