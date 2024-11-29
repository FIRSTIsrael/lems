from fastapi import FastAPI

from apps.scheduler.src.routers import scheduler

app = FastAPI()

app.include_router(scheduler.router)
