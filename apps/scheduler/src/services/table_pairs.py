import math
from dataclasses import dataclass

from models.lems import Table


@dataclass(frozen=True)
class TablePair:
    key: str
    side_a: str
    side_b: str


def build_table_pairs(tables: list[Table]) -> list[TablePair] | None:
    """Groups tables into pairs, or returns None when no table is paired."""
    paired = [table for table in tables if table.pair_key]
    if not paired:
        return None
    if len(paired) != len(tables):
        raise ValueError("Either all tables must be paired or none of them")

    sides: dict[str, dict[str, str]] = {}
    for table in paired:
        assert table.pair_key is not None
        pair_sides = sides.setdefault(table.pair_key, {})
        if table.side not in ("A", "B") or table.side in pair_sides:
            raise ValueError(
                f"Table pair {table.pair_key} must have exactly one A and one B side"
            )
        pair_sides[table.side] = table.id

    for key, pair_sides in sides.items():
        if len(pair_sides) != 2:
            raise ValueError(f"Table pair {key} must have exactly one A and one B side")

    # order by the position of each pair's side-A table in the input
    order = {table.id: index for index, table in enumerate(tables)}
    return [
        TablePair(key, pair_sides["A"], pair_sides["B"])
        for key, pair_sides in sorted(
            sides.items(), key=lambda item: order[item[1]["A"]]
        )
    ]


def paired_slot_counts(pair_count: int, stagger: bool) -> tuple[int, int]:
    """Returns (odd_match_slots, even_match_slots)."""
    if not stagger:
        return 2 * pair_count, 2 * pair_count
    return 2 * (pair_count // 2), 2 * (pair_count - pair_count // 2)


def paired_matches_per_round(team_count: int, odd_slots: int, even_slots: int) -> int:
    """Smallest match count per round that fits every team, assuming the worst
    starting parity."""
    low, high = min(odd_slots, even_slots), max(odd_slots, even_slots)
    matches = 1
    while math.ceil(matches / 2) * low + (matches // 2) * high < team_count:
        matches += 1
    return matches
