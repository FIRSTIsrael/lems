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

logger = logging.getLogger("lems.scheduler")
router = APIRouter(prefix="/scheduler")


@router.get("/validate")
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

    print("Hi")

    try:
        pass
    except SchedulerError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        )

    logger.info("Schedule created successfully")
    response.status_code = status.HTTP_201_CREATED
    return CreateScheduleResponse(
        status_code=status.HTTP_201_CREATED,
        content={"ok": True, "error": None},
    )
