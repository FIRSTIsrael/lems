import datetime

from bson import ObjectId
from fastapi import APIRouter

from apps.scheduler.src.events.judging_room import JudgingRoom
from apps.scheduler.src.events.match import Match
from apps.scheduler.src.events.practice_match import PracticeMatch
from apps.scheduler.src.repository.mock_lems_repository import MockLemsRepository
from apps.scheduler.src.services.scheduler_service import SchedulerService

router = APIRouter(
    prefix="/scheduler"
)

EVENT_DATE = datetime.datetime(2020, 1, 1, 0, 0, 0)

TEAM_COUNT = 45
EVENTS = [
    JudgingRoom(30, 10, EVENT_DATE + datetime.timedelta(hours=8, minutes=30), TEAM_COUNT, 7, 0),
    PracticeMatch(10, 0, EVENT_DATE + datetime.timedelta(hours=8, minutes=30), TEAM_COUNT, 8, 1),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=10), TEAM_COUNT, 8, 2),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=11, minutes=30), TEAM_COUNT, 8, 3),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=14), TEAM_COUNT, 8, 4)
]

@router.post("/")
async def create_schedule() -> str:
    for i in range(1, 100):
        scheduler = SchedulerService(EVENTS, MockLemsRepository())
        teams, sessions = scheduler.create_schedule(ObjectId())

    return str(teams[0].team_number)
