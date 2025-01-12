import logging

from fastapi import FastAPI
from routers import scheduler

logging.getLogger(__name__).setLevel(logging.INFO)

app = FastAPI()

app.include_router(scheduler.router)
