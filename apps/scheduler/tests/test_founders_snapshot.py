import json
from pathlib import Path

from tests.helpers import run_case_in_subprocess

GOLDEN = Path(__file__).parent / "golden" / "founders_12.json"


def test_founders_12_matches_golden():
    with open(GOLDEN) as f:
        expected = json.load(f)
    assert run_case_in_subprocess("founders_12", 42) == expected
