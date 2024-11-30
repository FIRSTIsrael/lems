import datetime
import json

from bson import ObjectId
from fastapi import APIRouter

from apps.scheduler.src.events.event import Event
from apps.scheduler.src.events.judging_room import JudgingRoom
from apps.scheduler.src.events.match import Match
from apps.scheduler.src.events.practice_match import PracticeMatch
from apps.scheduler.src.repository.mock_lems_repository import MockLemsRepository
from apps.scheduler.src.services.scheduler_service import SchedulerService

router = APIRouter(
    prefix="/scheduler"
)

EVENT_DATE = datetime.datetime(2020, 1, 1, 0, 0, 0)

EVENTS = [
    JudgingRoom(30, 10, EVENT_DATE + datetime.timedelta(hours=8, minutes=30), 45, 7, 0),
    PracticeMatch(10, 0, EVENT_DATE + datetime.timedelta(hours=8, minutes=30), 45, 8, 1),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=10), 45, 8, 2),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=11, minutes=30), 45, 8, 3),
    Match(10, 0, EVENT_DATE + datetime.timedelta(hours=14), 45, 8, 4)
]

@router.post("/")
async def create_schedule() -> str:
    scheduler = SchedulerService(EVENTS, MockLemsRepository())
    teams, sessions = scheduler.create_schedule(ObjectId())
    for team in teams:
        print(team.team_number)
        for event in team.team_events:
            print(event)
    return "a"

@router.get("/{generation_token}")
async def get_scheduler_status(generation_token: str):
    return "No status available for generation token: " + generation_token
