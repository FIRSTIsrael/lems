from fastapi import APIRouter

router = APIRouter(
    prefix="/scheduler"
)

@router.post("/")
async def create_schedule() -> str:
    return "a"

@router.get("/{generation_token}")
async def get_scheduler_status(generation_token: str):
    return "No status available for generation token: " + generation_token
