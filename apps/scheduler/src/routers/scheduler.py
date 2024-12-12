from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from events.judging_session import JudgingSession
from events.ranking_match import Match
from events.practice_match import PracticeMatch
from models.create_schedule_request import CreateScheduleRequest
from services.scheduler_service import SchedulerService, SchedulerError
from repository.lems_repository import LemsRepository

router = APIRouter(prefix="/scheduler")

EVENT_DATE = datetime(2020, 1, 1, 0, 0, 0)

TEAM_COUNT = 45
EVENTS = [
    JudgingSession(
        30, 10, EVENT_DATE + timedelta(hours=8, minutes=30), TEAM_COUNT, 7, 0
    ),
    PracticeMatch(10, 0, EVENT_DATE + timedelta(hours=8, minutes=30), TEAM_COUNT, 8, 1),
    Match(10, 0, EVENT_DATE + timedelta(hours=10), TEAM_COUNT, 8, 2),
    Match(10, 0, EVENT_DATE + timedelta(hours=11, minutes=30), TEAM_COUNT, 8, 3),
    Match(10, 0, EVENT_DATE + timedelta(hours=14), TEAM_COUNT, 8, 4),
]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_schedule(create_schedule_request: CreateScheduleRequest) -> str:
    lems = LemsRepository()
    scheduler = SchedulerService(lems)

    try:
        scheduler.create_schedule(create_schedule_request)
    except SchedulerError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))

    return str("Ok")
