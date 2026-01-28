import logging
import math
import random
from datetime import timedelta
from typing import Literal, Optional
import pandas as pd
import numpy as np

from repository.lems_repository import LemsRepository
from services.validator_service import ValidatorService
from models.errors import ValidatorError, SchedulerError
from models.requests import SchedulerRequest
from config import (
    MIN_MINUTES_BETWEEN_EVENTS,
    TABLE_DIVERSITY_WEIGHT,
    WAIT_TIME_POOL_SIZE,
    RANDOM_SEED,
)

logger = logging.getLogger("lems.scheduler")


class SchedulerService:
    def __init__(
        self,
        lems_repository: LemsRepository,
        request: SchedulerRequest,
        seed: Optional[int] = None,
    ):
        self.lems_repository = lems_repository
        self.staggered = request.stagger_matches
        self.teams = lems_repository.get_teams()
        self.rooms = lems_repository.get_rooms()
        self.tables = lems_repository.get_tables()
        self.team_table_history: dict[str, dict[str, set[str]]] = {}

        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
        elif RANDOM_SEED is not None:
            random.seed(RANDOM_SEED)
            np.random.seed(RANDOM_SEED)

        self._validate_schedule(request)

    def _validate_schedule(self, request: SchedulerRequest):
        """Validate the schedule using the ValidatorService."""

        try:
            validator = ValidatorService(self.lems_repository, request)
            validator_data = validator.validate()
        except ValidatorError as error:
            logger.info(f"Initial validation failed: {error}")
            raise SchedulerError(f"Initial validation failed: {str(error)}")

        if validator_data is None:
            logger.info("Validation failed: No data returned")
            raise SchedulerError("Initial validation failed: No data returned")

        self.validator_data = validator_data
        self.sessions = validator.sessions
        self.matches = [match for round in validator.matches for match in round]

    def _make_sessions(self):
        """Create a DataFrame for the session schedule. Teams are assigned randomly."""

        columns = ["start_time", "end_time"] + [str(room.id) for room in self.rooms]
        teams = {team.slug for team in self.teams}

        rows = []
        for session in self.sessions:
            row_data = {
                "start_time": session["start_time"],
                "end_time": session["end_time"],
            }
            for room in self.rooms:
                team = np.random.choice(list(teams)) if len(teams) > 0 else pd.NA
                row_data[str(room.id)] = team
                if pd.notna(team):
                    teams.remove(team)
            rows.append(row_data)

        sessions = pd.DataFrame(
            rows,
            columns=columns,
            index=pd.RangeIndex(start=1, stop=len(rows) + 1),
        )
        sessions.index.name = "number"

        return sessions

    def _make_matches(self):
        """Create a DataFrame for the match schedule. Teams are not assigned yet."""

        table_columns = [str(table.id) for table in self.tables]
        columns = ["start_time", "end_time", "stage", "round"] + table_columns

        matches = pd.DataFrame(
            columns=columns,
            index=pd.RangeIndex(start=1, stop=len(self.matches) + 1),
        )
        matches.index.name = "number"

        for match in self.matches:
            matches.at[match["number"], "start_time"] = match["start_time"]
            matches.at[match["number"], "end_time"] = match["end_time"]
            matches.at[match["number"], "stage"] = match["stage"]
            matches.at[match["number"], "round"] = match["round"]

        return matches

    def _use_constraints(self):
        """Use the constraints from the validator to assign teams to matches."""

        for entry in self.validator_data:
            overlapping_rounds = entry["overlapping_rounds"]

            if len(overlapping_rounds) == 0:
                continue

            session = entry["session"]
            session_schedule = self.session_schedule.loc[session["number"]]
            session_teams = set(
                team for team in session_schedule.values[2:] if pd.notna(team)
            )

            for round in overlapping_rounds:
                available_matches = round["available_matches"]
                round_teams = session_teams.copy()

                for match in available_matches:
                    slots = match["slots"]
                    match_start = pd.to_datetime(
                        self.match_schedule.loc[match["number"], "start_time"]
                    )

                    gap_eligible_teams = [
                        team
                        for team in round_teams
                        if self._meets_minimum_gap(team, match_start)
                    ]

                    for _ in range(slots):
                        if len(gap_eligible_teams) > 0:
                            team = np.random.choice(list(gap_eligible_teams))
                            gap_eligible_teams.remove(team)
                            round_teams.discard(team)
                            self._assign_team(team, match["number"])
                        elif len(round_teams) > 0:
                            logger.warning(
                                f"Match {match['number']}: No teams meet minimum gap. "
                                f"Assigning from remaining teams anyway."
                            )
                            team = np.random.choice(list(round_teams))
                            round_teams.remove(team)
                            self._assign_team(team, match["number"])
                        else:
                            break

    def _assign_team(self, team: int, match_number: int) -> None:
        """Assign a team to a match in the match schedule.

        For staggered matches, teams are assigned to first half of tables on odd matches
        and second half on even matches. For non-staggered matches, teams can be assigned
        to any available table.
        """

        match_row = self.match_schedule.loc[match_number]
        table_columns = [str(table.id) for table in self.tables]

        if self.staggered:
            if match_number % 2 == 1:
                available_tables = table_columns[: len(table_columns) // 2]
            else:
                available_tables = table_columns[len(table_columns) // 2 :]
        else:
            available_tables = table_columns

        for table in available_tables:
            if pd.isna(match_row[table]):
                self.match_schedule.at[match_number, table] = team
                break

    def _did_team_play(
        self, team: str, stage: Literal["practice", "ranking"], round_num: int
    ) -> bool:
        """Check if a team has played in a specific round."""

        round_matches: pd.DataFrame = self.match_schedule[
            (self.match_schedule["stage"] == stage)
            & (self.match_schedule["round"] == round_num)
        ]
        teams_in_round = round_matches.values[~pd.isna(round_matches.values)]

        return team in teams_in_round

    def _did_team_reach_limit_on_table(
        self, team: str, table_id: str, stage: Literal["practice", "ranking"], limit=1
    ) -> bool:
        """Check if a team has played on a specific table in a specific stage.
        By default, this checks for 1 occurance, however a limit can be specified.
        """

        slot: pd.Series = self.match_schedule[table_id]
        stage_matches = self.match_schedule[
            (self.match_schedule["stage"] == stage) & (slot.notna())
        ]

        matches_on_table: pd.Series = stage_matches[table_id]
        teams_on_table = matches_on_table.values[~pd.isna(matches_on_table.values)]

        return list(teams_on_table).count(team) > limit

    def _get_available_tables(self, match_number: int) -> list[str]:
        """Get available table IDs based on match number when staggering is enabled."""

        table_columns = [str(table.id) for table in self.tables]

        if not self.staggered:
            return table_columns

        if match_number % 2 == 1:
            return table_columns[: len(table_columns) // 2]
        return table_columns[len(table_columns) // 2 :]

    def _get_last_event_time(
        self, team: str, current_time: pd.Timestamp
    ) -> pd.Timestamp | None:
        """Get the last event time (match or judging) for a team before the current time.
        If no events are found, return None."""

        def _get_time(df: pd.DataFrame) -> pd.Timestamp | None:
            events = df[
                (df.isin([team]).any(axis=1))
                & (pd.to_datetime(df["start_time"]) < current_time)
            ]
            if not events.empty:
                return pd.to_datetime(events["start_time"].max())
            return None

        last_match_time = _get_time(self.match_schedule)
        last_session_time = _get_time(self.session_schedule)

        return max(filter(None, [last_match_time, last_session_time]), default=None)

    def _meets_minimum_gap(self, team: str, match_start_time: pd.Timestamp) -> bool:
        """Check if a team meets the minimum gap constraint for a match."""
        last_event_time = self._get_last_event_time(team, match_start_time)

        if last_event_time is None:
            return True

        gap_seconds = (match_start_time - last_event_time).total_seconds()
        min_gap_seconds = MIN_MINUTES_BETWEEN_EVENTS * 60

        return gap_seconds >= min_gap_seconds

    def _score_team_for_table(
        self, team: str, table_id: str, stage: str, wait_time: float
    ) -> float:
        """Score a team for a table considering wait time and table diversity."""
        stage_history = self.team_table_history.get(stage, {})
        team_tables = stage_history.get(team, set())

        novelty_bonus = 0 if table_id in team_tables else 1

        normalized_wait = wait_time / 3600.0
        diversity_component = TABLE_DIVERSITY_WEIGHT * novelty_bonus
        wait_component = (1 - TABLE_DIVERSITY_WEIGHT) * normalized_wait

        return diversity_component + wait_component

    def _update_table_history(self, team: str, table_id: str, stage: str):
        """Update the table history for a team."""
        if stage not in self.team_table_history:
            self.team_table_history[stage] = {}

        if team not in self.team_table_history[stage]:
            self.team_table_history[stage][team] = set()

        self.team_table_history[stage][team].add(table_id)

    def _populate_match_schedule(self):
        """Populate the remaining slots in the match schedule while respecting constraints.

        Constraints:
        1. Teams play exactly one match per round
        2. Teams can only play once on each table per stage
        3. Time between all events (matches and judging) should be balanced for each team
        4. Respect staggered matches configuration
        """

        # Check if there are enough tables for ranking rounds
        ranking_rounds = self.match_schedule[self.match_schedule["stage"] == "ranking"][
            "round"
        ].nunique()
        max_times_team_can_play_on_table = math.ceil(len(self.tables) / ranking_rounds)

        available_teams = {team.slug for team in self.teams}
        sorted_matches = self.match_schedule.sort_values(["start_time", "number"])

        for match_num, match in sorted_matches.iterrows():
            stage = match["stage"]
            round_num = match["round"]
            current_time = pd.to_datetime(match["start_time"])

            available_tables = self._get_available_tables(match_num)
            available_tables = np.copy(available_tables)
            random.shuffle(available_tables)
            assigned_teams = {}
            unassigned_tables = []

            # First pass: Try to assign eligible teams to tables
            for table in available_tables:
                if pd.notna(match[table]):
                    assigned_teams[table] = match[table]
                    continue

                eligible_teams = [
                    team
                    for team in available_teams
                    if not self._did_team_play(team, stage, round_num)
                    and not self._did_team_reach_limit_on_table(
                        team,
                        table,
                        stage,
                        limit=max_times_team_can_play_on_table,
                    )
                ]

                if not eligible_teams:
                    unassigned_tables.append(table)
                    continue

                gap_eligible_teams = [
                    team
                    for team in eligible_teams
                    if self._meets_minimum_gap(team, current_time)
                ]

                if not gap_eligible_teams:
                    logger.error(
                        f"No teams meet minimum gap for match {match_num}, table {table}. "
                        f"Eligible teams: {eligible_teams}"
                    )
                    raise SchedulerError(
                        f"Cannot satisfy minimum gap constraint for match {match_num}. "
                        "Validator should have prevented this."
                    )

                stage_history = self.team_table_history.get(stage, {})
                novel_table_teams = [
                    team
                    for team in gap_eligible_teams
                    if table not in stage_history.get(team, set())
                ]

                candidates = (
                    novel_table_teams if novel_table_teams else gap_eligible_teams
                )

                waiting_times = {}
                for team in candidates:
                    last_event_time = self._get_last_event_time(team, current_time)
                    if last_event_time is None:
                        waiting_times[team] = float("inf")
                    else:
                        waiting_times[team] = (
                            current_time - last_event_time
                        ).total_seconds()

                sorted_by_wait = sorted(
                    waiting_times.items(), key=lambda x: x[1], reverse=True
                )
                top_candidates = [
                    team for team, _ in sorted_by_wait[:WAIT_TIME_POOL_SIZE]
                ]

                if len(top_candidates) > 1:
                    selected_team = random.choice(top_candidates)
                else:
                    selected_team = top_candidates[0]

                self.match_schedule.at[match_num, table] = selected_team
                assigned_teams[table] = selected_team
                self._update_table_history(selected_team, table, stage)

            # Second pass: Handle unassigned tables through swapping
            if unassigned_tables:
                for unassigned_table in unassigned_tables:
                    unplayed_teams = [
                        team
                        for team in available_teams
                        if not self._did_team_play(team, stage, round_num)
                        and team not in assigned_teams.values()
                        and self._meets_minimum_gap(team, current_time)
                    ]

                    if not unplayed_teams:
                        continue

                    for team in unplayed_teams:
                        swap_found = False
                        for assigned_table, assigned_team in assigned_teams.items():
                            swap_valid = not self._did_team_reach_limit_on_table(
                                team,
                                assigned_table,
                                stage,
                                max_times_team_can_play_on_table,
                            )

                            if swap_valid:
                                self.match_schedule.at[match_num, assigned_table] = team
                                self.match_schedule.at[match_num, unassigned_table] = (
                                    assigned_team
                                )
                                assigned_teams[assigned_table] = team
                                assigned_teams[unassigned_table] = assigned_team
                                self._update_table_history(team, assigned_table, stage)
                                swap_found = True
                                break

                        if swap_found:
                            break

    def _ensure_constraints(self, stage: Literal["practice", "ranking"]):
        """
        Ensure that all constraints are satisfied in the match schedule.
        1. Teams play exactly one match per round
        """

        stage_schedule = self.match_schedule[self.match_schedule["stage"] == stage]
        rounds = stage_schedule["round"].unique()

        for round_num in rounds:
            round_matches = self.match_schedule[
                (self.match_schedule["stage"] == stage)
                & (self.match_schedule["round"] == round_num)
            ]

            # Get all teams that played in this round
            teams_in_round = []
            for table in [str(table.id) for table in self.tables]:
                _table_matches: pd.Series = round_matches[table]
                teams = _table_matches.dropna().tolist()
                teams_in_round.extend(teams)

            # Check if any team played multiple times
            for team in teams_in_round:
                if teams_in_round.count(team) > 1:
                    raise SchedulerError(
                        f"Team {team} played multiple times in round {round_num}"
                    )

            # Check if any team didn't play
            all_team_slugs = {team.slug for team in self.teams}
            missing_teams = len(set(all_team_slugs)) - len(teams_in_round)
            if missing_teams > 0:
                raise SchedulerError(
                    f"Teams {missing_teams} did not play in round {round_num}"
                )

    def _analyze_schedule(self):
        """Analyze the schedule and log statistics."""
        team_intervals = {}
        team_table_counts = {}

        for team in self.teams:
            team_events = []

            match_events = self.match_schedule[
                self.match_schedule.isin([team.slug]).any(axis=1)
            ][["start_time", "end_time"]].values.tolist()

            session_events = self.session_schedule[
                self.session_schedule.isin([team.slug]).any(axis=1)
            ][["start_time", "end_time"]].values.tolist()

            team_events = sorted(
                match_events + session_events,
                key=lambda x: pd.to_datetime(x[0]),
            )

            if len(team_events) > 1:
                time_diffs = [
                    (
                        pd.to_datetime(team_events[i + 1][0])
                        - pd.to_datetime(team_events[i][1])
                    ).total_seconds()
                    for i in range(len(team_events) - 1)
                ]
                team_intervals[team.slug] = time_diffs

            all_tables = set()
            for stage in self.team_table_history.values():
                if team.slug in stage:
                    all_tables.update(stage[team.slug])
            team_table_counts[team.slug] = len(all_tables)

        team_averages = [
            sum(diffs) / len(diffs) for diffs in team_intervals.values() if diffs
        ]
        team_minimums = [min(diffs) for diffs in team_intervals.values() if diffs]

        overall_avg = sum(team_averages) / len(team_averages) if team_averages else 0
        overall_min = min(team_minimums) if team_minimums else 0

        avg_unique_tables = (
            sum(team_table_counts.values()) / len(team_table_counts)
            if team_table_counts
            else 0
        )

        logger.info(
            f"Average time between events: {int(overall_avg//60):02d}:{int(overall_avg%60):02d}"
        )
        logger.info(
            f"Minimum time between events: {int(overall_min//60):02d}:{int(overall_min%60):02d}"
        )
        logger.info(f"Average unique tables per team: {avg_unique_tables:.2f}")

        for stage, stage_history in self.team_table_history.items():
            stage_unique_tables = [len(tables) for tables in stage_history.values()]
            if stage_unique_tables:
                avg_stage_unique = sum(stage_unique_tables) / len(stage_unique_tables)
                logger.info(
                    f"{stage.capitalize()} stage - Avg unique tables: {avg_stage_unique:.2f}"
                )

    def create_schedule(self) -> tuple[pd.DataFrame, pd.DataFrame]:
        """Create the schedule by populating the match schedule and ensuring constraints.
        Returns (match_schedule, session_schedule).
        """

        self.session_schedule = self._make_sessions()
        self.match_schedule = self._make_matches()

        self._use_constraints()
        self._populate_match_schedule()

        self._ensure_constraints("practice")
        self._ensure_constraints("ranking")
        self._analyze_schedule()

        return self.match_schedule.copy(), self.session_schedule.copy()
