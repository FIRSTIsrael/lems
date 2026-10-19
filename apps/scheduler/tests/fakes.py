from datetime import datetime, timezone

from models.lems import Location, Table, Team
from models.requests import SchedulerRequest


class FakeLemsRepository:
    """Duck-types LemsRepository without env vars or HTTP."""

    def __init__(
        self, teams: list[Team], rooms: list[Location], tables: list[Table]
    ):
        self._teams = teams
        self._rooms = rooms
        self._tables = tables

    def get_teams(self) -> list[Team]:
        return list(self._teams)

    def get_rooms(self) -> list[Location]:
        return list(self._rooms)

    def get_tables(self) -> list[Table]:
        return list(self._tables)


def make_teams(n: int) -> list[Team]:
    return [Team(f"team-{i}", i, "IL", f"IL-{i}") for i in range(1, n + 1)]


def make_founders_tables(n: int) -> list[Table]:
    return [Table(f"t{i}", f"Table {i}") for i in range(1, n + 1)]


def make_paired_tables(pairs: int) -> list[Table]:
    tables: list[Table] = []
    for i in range(1, pairs + 1):
        tables.append(Table(f"p{i}-A", f"Pair {i} – A", f"pair-{i}", "A"))
        tables.append(Table(f"p{i}-B", f"Pair {i} – B", f"pair-{i}", "B"))
    return tables


def make_rooms(n: int) -> list[Location]:
    return [Location(f"r{i}", f"Room {i}") for i in range(1, n + 1)]


def make_request(
    *, stagger: bool = False, overlap: bool = False, cycle_seconds: int = 300
) -> SchedulerRequest:
    # 08:30 does not validate for 12 paired teams, so the overlap start is
    # shifted to the first 5-minute step that does
    matches_start = (
        datetime(2026, 1, 1, 9, 35, tzinfo=timezone.utc)
        if overlap
        else datetime(2026, 1, 1, 11, 0, tzinfo=timezone.utc)
    )
    return SchedulerRequest(
        division_id="d",
        matches_start=matches_start,
        practice_rounds=1,
        ranking_rounds=3,
        match_length_seconds=150,
        practice_match_cycle_time_seconds=cycle_seconds,
        ranking_match_cycle_time_seconds=cycle_seconds,
        stagger_matches=stagger,
        judging_start=datetime(2026, 1, 1, 8, 0, tzinfo=timezone.utc),
        judging_session_length_seconds=1200,
        judging_cycle_time_seconds=1500,
        breaks=[],
        timezone="UTC",
    )
