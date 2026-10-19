import pandas as pd
import pytest

from models.errors import SchedulerError
from tests.helpers import build_service, pair_occupancy

PAIRED_CASES = [
    "paired_8",
    "paired_12",
    "paired_17",
    "paired_24",
    "paired_12_stagger_odd",
    "paired_12_overlap",
]
SEEDS = [1, 2, 3]


@pytest.mark.parametrize("seed", SEEDS)
@pytest.mark.parametrize("case", PAIRED_CASES)
def test_every_team_plays_once_per_round(case, seed):
    service = build_service(case, seed)
    matches, _ = service.create_schedule()
    table_ids = [str(t.id) for t in service.tables]
    for _, round_rows in matches.groupby(["stage", "round"]):
        teams = [v for v in round_rows[table_ids].values.ravel() if pd.notna(v)]
        assert len(teams) == len(set(teams)) == len(service.teams)


@pytest.mark.parametrize("seed", SEEDS)
@pytest.mark.parametrize("case", PAIRED_CASES)
def test_at_most_one_half_pair_per_match(case, seed):
    service = build_service(case, seed)
    service.create_schedule()
    for occupancy in pair_occupancy(service):
        assert occupancy.count(1) <= 1


@pytest.mark.parametrize("seed", SEEDS)
def test_stagger_by_pair(seed):
    service = build_service("paired_12_stagger_odd", seed)
    service.create_schedule()
    for number, occupancy in zip(service.match_schedule.index, pair_occupancy(service)):
        if number % 2 == 1:
            assert occupancy[1:] == [0, 0]
        else:
            assert occupancy[0] == 0


@pytest.mark.parametrize("seed", SEEDS)
@pytest.mark.parametrize("case", ["paired_8", "paired_12", "paired_17", "paired_24"])
def test_opponent_repeats_minimized(case, seed):
    service = build_service(case, seed)
    service.create_schedule()
    assert service._count_opponent_repeats("ranking") <= 1


@pytest.mark.parametrize("seed", SEEDS)
def test_paired_overlap_consolidates_half_pairs(seed):
    service = build_service("paired_12_overlap", seed)
    service.create_schedule()
    for occupancy in pair_occupancy(service):
        assert occupancy.count(1) <= 1


def test_ensure_constraints_rejects_two_half_pairs():
    service = build_service("paired_12", 1)
    service.create_schedule()
    assert service.pairs is not None
    first = int(service.match_schedule.index[0])
    for pair in service.pairs[:2]:
        service.match_schedule.at[first, pair.side_a] = "team-1"
        service.match_schedule.at[first, pair.side_b] = pd.NA
    stage = service.match_schedule.at[first, "stage"]
    with pytest.raises(SchedulerError, match="half-filled"):
        service._ensure_constraints(stage)
