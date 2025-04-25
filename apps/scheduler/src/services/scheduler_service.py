import logging
from typing import Literal
import pandas as pd
import numpy as np

from repository.lems_repository import LemsRepository
from services.validator_service import ValidatorService
from models.errors import ValidatorError, SchedulerError
from models.requests import SchedulerRequest

logger = logging.getLogger("lems.scheduler")


class SchedulerService:
    def __init__(self, lems_repository: LemsRepository, request: SchedulerRequest):
        self.lems_repository = lems_repository
        self.staggered = request.stagger_matches
        self.teams = lems_repository.get_teams()
        self.rooms = lems_repository.get_rooms()
        self.tables = lems_repository.get_tables()
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
        """Create a DataFrame for the session schedule."""

        columns = ["start_time", "end_time"] + [str(room.id) for room in self.rooms]
        _teams = {team.number for team in self.teams}

        # Prepare row data
        rows = []
        for session in self.sessions:
            row_data = {
                "start_time": session["start_time"],
                "end_time": session["end_time"],
            }
            for room in self.rooms:
                _team = np.random.choice(list(_teams)) if len(_teams) > 0 else pd.NA
                row_data[str(room.id)] = _team
                if pd.notna(_team):
                    _teams.remove(_team)
            rows.append(row_data)

        # Create DataFrame with all data at once
        sessions = pd.DataFrame(
            rows, columns=columns, index=pd.RangeIndex(start=1, stop=len(rows) + 1)
        )
        sessions.index.name = "number"

        return sessions

    def _make_matches(self):
        """Create a DataFrame for the match schedule."""

        columns = ["start_time", "end_time", "stage", "round"] + [
            str(table.id) for table in self.tables
        ]
        matches = pd.DataFrame(
            columns=columns, index=pd.RangeIndex(start=1, stop=len(self.matches) + 1)
        )
        matches.index.name = "number"
        matches.fillna(pd.NA, inplace=True)

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
            _session_teams = set(session_schedule.values[2:])

            for round in overlapping_rounds:
                available_matches = round["available_matches"]
                _round_teams = _session_teams.copy()

                for match in available_matches:
                    slots = match["slots"]
                    for i in range(slots):
                        _team = (
                            np.random.choice(list(_round_teams))
                            if len(_round_teams) > 0
                            else pd.NA
                        )
                        if pd.notna(_team):
                            _round_teams.remove(_team)
                            self._assign_team(_team, match["number"])

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
        self, team: int, stage: Literal["practice", "ranking"], round_num: int
    ) -> bool:
        """Check if a team has played in a specific round.

        Args:
            team: The team number to check
            stage: The stage of the competition
            round_num: The round number to check

        Returns:
            bool: True if team has already played in this round, False otherwise
        """

        round_matches: pd.DataFrame = self.match_schedule[
            (self.match_schedule["stage"] == stage)
            & (self.match_schedule["round"] == round_num)
        ]

        teams_in_round = round_matches.values[~pd.isna(round_matches.values)]
        return team in teams_in_round

    def _did_team_play_on_table(
        self, team: int, table_id: str, stage: Literal["practice", "ranking"]
    ) -> bool:
        """Check if a team has played on a specific table in a specific stage.

        Args:
            team: The team number to check
            table_id: The table ID to check
            stage: The stage of the competition

        Returns:
            bool: True if team has already played on this table in this stage, False otherwise
        """
        slot: pd.Series = self.match_schedule[table_id]
        stage_matches = self.match_schedule[
            (self.match_schedule["stage"] == stage) & (slot.notna())
        ]

        matches_on_table: pd.Series = stage_matches[table_id]
        teams_on_table = matches_on_table.values[~pd.isna(matches_on_table.values)]

        return team in teams_on_table

    def _get_available_tables(self, match_number: int) -> list[str]:
        """Get available tables based on match number when staggering is enabled."""
        table_columns = [str(table.id) for table in self.tables]

        if not self.staggered:
            return table_columns

        if match_number % 2 == 1:
            return table_columns[: len(table_columns) // 2]
        return table_columns[len(table_columns) // 2 :]

    def _get_team_last_event_time(
        self, team: int, current_time: pd.Timestamp
    ) -> pd.Timestamp | None:
        """Get the last event time (match or judging) for a team before the current time.

        Args:
            team: The team number to check
            current_time: Only consider events before this time

        Returns:
            The datetime of the team's most recent event before current_time, or None if no previous events
        """

        # Check match schedule
        team_matches: pd.Series = self.match_schedule[
            (self.match_schedule.isin([team]).any(axis=1))
            & (pd.to_datetime(self.match_schedule["start_time"]) < current_time)
        ]
        last_match_time = None
        if not team_matches.empty:
            _match_times: pd.Series = team_matches["start_time"]
            last_match_time = pd.to_datetime(_match_times.max())

        # Check session schedule
        team_sessions: pd.Series = self.session_schedule[
            (self.session_schedule.isin([team]).any(axis=1))
            & (pd.to_datetime(self.session_schedule["start_time"]) < current_time)
        ]
        last_session_time = None
        if not team_sessions.empty:
            _session_times: pd.Series = team_sessions["start_time"]
            last_session_time = pd.to_datetime(_session_times.max())

        return max(filter(None, [last_match_time, last_session_time]), default=None)

    def _populate_match_schedule(self):
        """Populate the remaining slots in the match schedule while respecting constraints.

        Constraints:
        1. Teams play exactly one match per round
        2. Teams can only play once on each table per stage
        3. Time between all events (matches and judging) should be balanced for each team
        4. Respect staggered matches configuration
        """

        available_teams = set(team.number for team in self.teams)
        sorted_matches = self.match_schedule.sort_values(["start_time", "number"])

        for match_num, match in sorted_matches.iterrows():
            stage = match["stage"]
            round_num = match["round"]

            available_tables = self._get_available_tables(match_num)
            assigned_teams = {}  # Keep track of teams assigned in this match
            unassigned_tables = []  # Tables that need teams

            # First pass: Try to assign eligible teams to tables
            for table in available_tables:
                if pd.notna(match[table]):
                    assigned_teams[table] = match[table]
                    continue

                eligible_teams = [
                    team
                    for team in available_teams
                    if not self._did_team_play(team, stage, round_num)
                    and not self._did_team_play_on_table(team, table, stage)
                ]

                if eligible_teams:
                    # Calculate waiting times for eligible teams
                    current_time = pd.to_datetime(match["start_time"])
                    waiting_times = {}

                    for team in eligible_teams:
                        last_event_time = self._get_team_last_event_time(
                            team, current_time
                        )
                        if last_event_time is None:
                            waiting_times[team] = float("inf")
                        else:
                            waiting_times[team] = (
                                current_time - last_event_time
                            ).total_seconds()

                    selected_team = max(waiting_times.items(), key=lambda x: x[1])[0]
                    self.match_schedule.at[match_num, table] = selected_team
                    assigned_teams[table] = selected_team
                else:
                    unassigned_tables.append(table)

            # Second pass: Handle unassigned tables through swapping
            if unassigned_tables:
                for unassigned_table in unassigned_tables:
                    # Find a team that needs to play but hasn't been assigned
                    unplayed_teams = [
                        team
                        for team in available_teams
                        if not self._did_team_play(team, stage, round_num)
                        and team not in assigned_teams.values()
                    ]

                    if not unplayed_teams:
                        continue

                    # For each unplayed team, try to find a swap
                    for team in unplayed_teams:
                        swap_found = False
                        # Try each assigned table/team for a potential swap
                        for assigned_table, assigned_team in assigned_teams.items():
                            # Check if the swap would be valid
                            if not self._did_team_play_on_table(
                                team, assigned_table, stage
                            ) and not self._did_team_play_on_table(
                                assigned_team, unassigned_table, stage
                            ):
                                # Perform the swap
                                self.match_schedule.at[match_num, assigned_table] = team
                                self.match_schedule.at[match_num, unassigned_table] = (
                                    assigned_team
                                )
                                assigned_teams[assigned_table] = team
                                assigned_teams[unassigned_table] = assigned_team
                                swap_found = True
                                break

                        if swap_found:
                            break

    def _ensure_constraints(self, stage: Literal["practice", "ranking"]):
        """
        Ensure that all constraints are satisfied in the match schedule.
        1. Teams play exactly one match per round
        """

        rounds = self.match_schedule[self.match_schedule["stage"] == stage][
            "round"
        ].unique()

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
            all_team_numbers = {team.number for team in self.teams}
            missing_teams = len(set(all_team_numbers)) - len(teams_in_round)
            if missing_teams > 0:
                raise SchedulerError(
                    f"Teams {missing_teams} did not play in round {round_num}"
                )

    def _analyze_schedule(self):
        """Analyze the schedule and log statistics."""

        team_intervals = {}

        for team in self.teams:
            team_events = []

            # Get match events with start and end times
            match_events = self.match_schedule[
                self.match_schedule.isin([team.number]).any(axis=1)
            ][["start_time", "end_time"]].values.tolist()

            # Get session events with start and end times
            session_events = self.session_schedule[
                self.session_schedule.isin([team.number]).any(axis=1)
            ][["start_time", "end_time"]].values.tolist()

            # Combine and sort all events by start time
            team_events = sorted(
                match_events + session_events, key=lambda x: pd.to_datetime(x[0])
            )

            # Calculate time differences between end of one event and start of next
            if len(team_events) > 1:
                time_diffs = [
                    (
                        pd.to_datetime(team_events[i + 1][0])
                        - pd.to_datetime(team_events[i][1])
                    ).total_seconds()
                    for i in range(len(team_events) - 1)
                ]
                team_intervals[team.number] = time_diffs

        team_averages = [
            sum(diffs) / len(diffs) for diffs in team_intervals.values() if diffs
        ]
        team_minimums = [min(diffs) for diffs in team_intervals.values() if diffs]

        overall_avg = sum(team_averages) / len(team_averages) if team_averages else 0
        overall_min = min(team_minimums) if team_minimums else 0

        logger.info(
            f"Average time between events: {int(overall_avg//60):02d}:{int(overall_avg%60):02d}"
        )
        logger.info(
            f"Minimum time between events: {int(overall_min//60):02d}:{int(overall_min%60):02d}"
        )

    def create_schedule(self):
        self.session_schedule = self._make_sessions()
        self.match_schedule = self._make_matches()

        self._use_constraints()
        self._populate_match_schedule()

        self._ensure_constraints("practice")
        self._ensure_constraints("ranking")
        self._analyze_schedule()
        self.session_schedule.to_csv(f"session_schedule.csv", index=True)
        self.match_schedule.to_csv(f"match_schedule.csv", index=True)
