import logging
import os

from pathlib import Path
from fastapi import FastAPI
from routers import scheduler
from dotenv import load_dotenv

logger = logging.getLogger("lems.scheduler")
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)

is_production = os.getenv("PYTHON_ENV") == "production"
if not is_production:
    project_root = Path(__file__).parent.parent
    env_path = project_root / ".env.local"
    logger.info(f"Loading .env file: {env_path}")
    load_dotenv(dotenv_path=env_path)


logger.debug("Starting the app")

app = FastAPI()

app.include_router(scheduler.router)
