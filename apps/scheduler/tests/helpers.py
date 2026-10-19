import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

from services.scheduler_service import SchedulerService
from tests.fakes import (
    FakeLemsRepository,
    make_founders_tables,
    make_request,
    make_rooms,
    make_teams,
)

SCHEDULER_DIR = Path(__file__).resolve().parent.parent


def _cell(value):
    if value is None or value is pd.NaT:
        return None
    if isinstance(value, (datetime, pd.Timestamp)):
        return value.isoformat()
    if not isinstance(value, (list, tuple, dict)) and pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def _frame_to_json(df: pd.DataFrame) -> dict:
    return {
        "index": [_cell(i) for i in df.index],
        "columns": [str(c) for c in df.columns],
        "data": [[_cell(v) for v in row] for row in df.itertuples(index=False)],
    }


def schedule_to_json(matches: pd.DataFrame, sessions: pd.DataFrame) -> dict:
    return {"matches": _frame_to_json(matches), "sessions": _frame_to_json(sessions)}


CASES = {
    "founders_12": lambda: (
        FakeLemsRepository(make_teams(12), make_rooms(3), make_founders_tables(4)),
        make_request(stagger=False, overlap=False),
    ),
}


def run_case(case: str, seed: int) -> dict:
    repository, request = CASES[case]()
    matches, sessions = SchedulerService(
        repository, request, seed=seed
    ).create_schedule()
    return schedule_to_json(matches, sessions)


def run_case_in_subprocess(case: str, seed: int) -> dict:
    code = (
        "import json, sys; sys.path.insert(0, 'src'); "
        "from tests.helpers import run_case; "
        f"print(json.dumps(run_case({case!r}, {seed!r})))"
    )
    result = subprocess.run(
        [sys.executable, "-c", code],
        cwd=SCHEDULER_DIR,
        env={**os.environ, "PYTHONHASHSEED": "0"},
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
    return json.loads(result.stdout.strip().splitlines()[-1])
