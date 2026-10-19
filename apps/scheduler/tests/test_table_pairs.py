import pytest

from tests.fakes import (
    FakeLemsRepository,
    make_founders_tables,
    make_paired_tables,
    make_request,
    make_rooms,
    make_teams,
)
from models.errors import ValidatorError
from models.lems import Table
from services.table_pairs import (
    TablePair,
    build_table_pairs,
    paired_matches_per_round,
    paired_slot_counts,
)
from services.validator_service import ValidatorService


def test_build_none_for_founders():
    assert build_table_pairs(make_founders_tables(4)) is None  # type: ignore[arg-type]


def test_build_orders_by_side_a():
    tables = [
        Table("b2", "2B", "pair-2", "B"),
        Table("a1", "1A", "pair-1", "A"),
        Table("a2", "2A", "pair-2", "A"),
        Table("b1", "1B", "pair-1", "B"),
    ]
    assert build_table_pairs(tables) == [
        TablePair("pair-1", "a1", "b1"),
        TablePair("pair-2", "a2", "b2"),
    ]


def test_build_rejects_mixed():
    tables = make_paired_tables(1) + [Table("x", "X")]
    with pytest.raises(ValueError):
        build_table_pairs(tables)


def test_build_rejects_incomplete_pair():
    with pytest.raises(ValueError):
        build_table_pairs([Table("a1", "1A", "pair-1", "A")])


def test_slot_counts():
    assert paired_slot_counts(3, True) == (2, 4)
    assert paired_slot_counts(4, True) == (4, 4)
    assert paired_slot_counts(3, False) == (6, 6)


def test_matches_per_round():
    assert paired_matches_per_round(17, 2, 4) == 6
    assert paired_matches_per_round(24, 8, 8) == 3
    assert paired_matches_per_round(9, 4, 4) == 3


def test_validator_rejects_single_pair_stagger():
    repo = FakeLemsRepository(make_teams(8), make_rooms(2), make_paired_tables(1))
    with pytest.raises(ValidatorError):
        ValidatorService(repo, make_request(stagger=True))  # type: ignore[arg-type]
