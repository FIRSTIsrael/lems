import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from models.validator import ValidatorError
from models.requests.create_schedule import CreateScheduleRequest
from models.requests.validate_schedule import (
    ValidateScheduleRequest,
    ValidateScheduleResponse,
)
from services.scheduler_service import SchedulerService, SchedulerError
from repository.lems_repository import LemsRepository
from services.validator_service import ValidatorService

logger = logging.getLogger("lems.scheduler")
router = APIRouter(prefix="/scheduler")


@router.get("/validate")
async def validate_schedule(
    request: ValidateScheduleRequest,
) -> ValidateScheduleResponse:
    logger.info(f"Validating schedule for division {request.division_id}")
    logger.debug(f"Request: {request}")
    lems = LemsRepository(request.division_id)

    validator = ValidatorService(lems, request)

    try:
        validator_data = validator.validate()
    except ValidatorError as error:
        return ValidateScheduleResponse(
            is_valid=False, error=str(error), data=error.data
        )

    return ValidateScheduleResponse(is_valid=True, data=validator_data)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_schedule(request: CreateScheduleRequest):
    logger.info(f"Creating schedule for division {request.division_id}")
    logger.debug(f"Request: {request}")
    lems = LemsRepository(request.division_id)
    scheduler = SchedulerService(lems)

    try:
        scheduler.create_schedule(request)
    except SchedulerError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "Schedule created successfully."},
    )
