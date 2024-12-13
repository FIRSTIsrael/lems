from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from models.create_schedule_request import CreateScheduleRequest
from services.scheduler_service import SchedulerService, SchedulerError
from repository.lems_repository import LemsRepository

router = APIRouter(prefix="/scheduler")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_schedule(create_schedule_request: CreateScheduleRequest) -> str:
    lems = LemsRepository()
    scheduler = SchedulerService(lems)

    try:
        scheduler.create_schedule(create_schedule_request)
    except SchedulerError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "Schedule created successfully."},
    )
