import logging
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

        columns = ["start_time", "end_time"] + [str(table.id) for table in self.tables]
        matches = pd.DataFrame(
            columns=columns, index=pd.RangeIndex(start=1, stop=len(self.matches) + 1)
        )
        matches.index.name = "number"
        matches.fillna(pd.NA, inplace=True)

        for match in self.matches:
            matches.at[match["number"], "start_time"] = match["start_time"]
            matches.at[match["number"], "end_time"] = match["end_time"]

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

    def _assign_team(self, team, match_number):
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

    def create_schedule(self):
        self.session_schedule = self._make_sessions()
        self.match_schedule = self._make_matches()

        self._use_constraints()

        # Save a CSV file with the schedule
        self.session_schedule.to_csv("session_schedule.csv", index=True)
        self.match_schedule.to_csv("match_schedule.csv", index=True)
