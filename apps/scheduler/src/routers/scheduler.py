from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from events.judging_session import JudgingSession
from events.ranking_match import Match
from events.practice_match import PracticeMatch
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


class CreateScheduleRequest(BaseModel):
    disivion_id: str

    tables: int
    judging_rooms: int

    # Question for raz: Does the schedule take into account that after the 30 minute session there is a 10 minute break
    # that does not affect the team and can be discarded when calculating min. time? Is that the wait_time parameter?
    judging_session_length_seconds: int
    judging_cycle_time_seconds: int
    match_length_seconds: int
    practice_match_cycle_time_seconds: int
    ranking_match_cycle_time_seconds: int

    practice_rounds: int = 1
    ranking_rounds: int = 3


# TODO: use the request type on the scheduler


@router.post("/")
async def create_schedule() -> str:

    lems = LemsRepository()
    scheduler = SchedulerService(EVENTS, lems)

    for i in range(1, 100):
        try:
            teams, activities = scheduler.create_schedule(
                ObjectId("674ad4973be3f0c967e853f1")
            )
        except SchedulerError as error:
            raise HTTPException(status_code=500, detail=str(error))

    lems.insert_schedule(activities)

    return str(teams[0].team_number)
