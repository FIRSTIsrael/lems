from fastapi import FastAPI

from .routers import scheduler

app = FastAPI()

app.include_router(scheduler.router)
