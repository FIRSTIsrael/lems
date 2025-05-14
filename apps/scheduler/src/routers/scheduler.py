import logging
from fastapi import APIRouter, HTTPException, status, Response

from models.errors import ValidatorError
from models.errors import SchedulerError
from models.requests import (
    SchedulerRequest,
    CreateScheduleResponse,
    ValidateScheduleResponse,
)
from repository.lems_repository import LemsRepository
from services.validator_service import ValidatorService
from services.scheduler_service import SchedulerService

logger = logging.getLogger("lems.scheduler")
router = APIRouter(prefix="/scheduler")


@router.post("/validate")
async def validate_schedule(
    request: SchedulerRequest, response: Response
) -> ValidateScheduleResponse:
    logger.info(f"Validating schedule for division {request.division_id}")
    logger.debug(f"Request: {request}")
    lems = LemsRepository(request.division_id)

    validator = ValidatorService(lems, request)

    try:
        validator_data = validator.validate()
    except ValidatorError as error:
        logger.info(f"Validation failed: {error}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ValidateScheduleResponse(
            is_valid=False, error=str(error), data=error.data
        )

    logger.info("Validation successful")
    response.status_code = status.HTTP_200_OK
    return ValidateScheduleResponse(is_valid=True, data=validator_data)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_schedule(
    request: SchedulerRequest, response: Response
) -> CreateScheduleResponse:
    logger.info(f"Creating schedule for division {request.division_id}")
    logger.debug(f"Request: {request}")

    lems = LemsRepository(request.division_id)
    scheduler = SchedulerService(lems, request)

    try:
        match_schedule, session_schedule = scheduler.create_schedule()
        lems.insert_sessions(session_schedule)
        lems.insert_matches(match_schedule)
    except SchedulerError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )

    logger.info("Schedule created successfully")
    response.status_code = status.HTTP_201_CREATED
    return CreateScheduleResponse(ok=True)
