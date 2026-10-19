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
    make_paired_tables,
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
    "paired_8": lambda: (
        FakeLemsRepository(make_teams(8), make_rooms(2), make_paired_tables(2)),
        make_request(stagger=False, overlap=False, cycle_seconds=900),
    ),
    "paired_12": lambda: (
        FakeLemsRepository(make_teams(12), make_rooms(3), make_paired_tables(3)),
        make_request(stagger=False, overlap=False, cycle_seconds=900),
    ),
    "paired_17": lambda: (
        FakeLemsRepository(make_teams(17), make_rooms(4), make_paired_tables(4)),
        make_request(stagger=False, overlap=False),
    ),
    "paired_24": lambda: (
        FakeLemsRepository(make_teams(24), make_rooms(4), make_paired_tables(4)),
        make_request(stagger=False, overlap=False),
    ),
    "paired_12_stagger_odd": lambda: (
        FakeLemsRepository(make_teams(12), make_rooms(3), make_paired_tables(3)),
        make_request(stagger=True, overlap=False),
    ),
    "paired_12_overlap": lambda: (
        FakeLemsRepository(make_teams(12), make_rooms(3), make_paired_tables(3)),
        make_request(stagger=False, overlap=True, cycle_seconds=900),
    ),
}


def build_service(case: str, seed: int) -> SchedulerService:
    repository, request = CASES[case]()
    return SchedulerService(repository, request, seed=seed)


def run_case(case: str, seed: int) -> dict:
    matches, sessions = build_service(case, seed).create_schedule()
    return schedule_to_json(matches, sessions)


def pair_occupancy(service: SchedulerService) -> list[list[int]]:
    assert service.pairs is not None
    return [
        [
            int(pd.notna(row[pair.side_a])) + int(pd.notna(row[pair.side_b]))
            for pair in service.pairs
        ]
        for _, row in service.match_schedule.iterrows()
    ]


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
