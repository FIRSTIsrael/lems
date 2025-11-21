import os
import logging
import requests
import jwt
import pandas as pd
from models.errors import SchedulerError
from models.lems import Team as TeamModel, Location as LocationModel

logger = logging.getLogger("lems.scheduler")


class LemsRepository:
    def __init__(self, division_id: str):
        self.division_id = division_id

        self.base_url = os.getenv("LOCAL_BASE_URL", "http://localhost:3333")
        self.scheduler_jwt_secret = os.getenv("SCHEDULER_JWT_SECRET")

        if not self.scheduler_jwt_secret:
            raise ValueError("SCHEDULER_JWT_SECRET environment variable is required")

        self.auth_token = jwt.encode({}, self.scheduler_jwt_secret, algorithm="HS256")

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json",
            }
        )

        self.api_base = f"{self.base_url}/scheduler/divisions/{division_id}"

        self._teams_by_slug = {}
        self._load_teams_cache()

        logger.info(f"🔗 Connecting to LEMS API at {self.base_url}")
        logger.info("🚀 HTTP Client configured for scheduler API.")

    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        Make an authenticated HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            **kwargs: Additional arguments for requests

        Returns:
            Response object

        Raises:
            requests.RequestException: If request fails
        """
        url = f"{self.api_base}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            logger.error(f"❌ API request failed: {method} {url} - {e}")
            raise

    def _load_teams_cache(self):
        """Load all teams into a cache for efficient lookups by team slug."""
        logger.debug("Loading teams cache for efficient lookups")
        try:
            teams = self.get_teams()
            self._teams_by_slug = {team.slug: team.id for team in teams}
            logger.debug(f"Cached {len(self._teams_by_slug)} teams")
        except Exception as e:
            logger.error(f"Failed to load teams cache: {e}")
            self._teams_by_slug = {}

    def get_teams(self) -> list[TeamModel]:
        logger.debug(f"Fetching teams for division {self.division_id}")

        response = self._make_request("GET", "/teams")
        teams_data = response.json()

        teams = [
            TeamModel(
                team["id"],
                team["number"],
                team["region"],
                team["slug"],
            )
            for team in teams_data
        ]
        logger.debug(f"Retrieved {len(teams)} teams")
        return teams

    def get_rooms(self) -> list[LocationModel]:
        logger.debug(f"Fetching judging rooms for division {self.division_id}")

        response = self._make_request("GET", "/rooms")
        rooms_data = response.json()

        rooms = [LocationModel(room["id"], room["name"]) for room in rooms_data]
        logger.debug(f"Retrieved {len(rooms)} judging rooms")
        return rooms

    def get_tables(self) -> list[LocationModel]:
        logger.debug(f"Fetching robot game tables for division {self.division_id}")

        response = self._make_request("GET", "/tables")
        tables_data = response.json()

        tables = [LocationModel(table["id"], table["name"]) for table in tables_data]
        logger.debug(f"Retrieved {len(tables)} robot game tables")
        return tables

    def get_lems_team_id(self, team_slug: str) -> str | None:
        """Get team ID by team slug using cached data."""
        if team_slug is None:
            return None
        return self._teams_by_slug.get(team_slug)

    def insert_sessions(self, session_schedule: pd.DataFrame):
        logger.debug("Submitting judging sessions to API")

        sessions_to_insert = []
        ignore_columns = ["start_time", "end_time"]

        for index, row in session_schedule.iterrows():
            scheduled_time = row["start_time"]

            for room_id, _team_slug in row[len(ignore_columns) :].items():
                team_slug = str(_team_slug) if pd.notna(_team_slug) else None
                team_id = self.get_lems_team_id(team_slug) if team_slug else None

                session_data = {
                    "division_id": self.division_id,
                    "number": index,
                    "scheduled_time": scheduled_time.isoformat(),
                    "room_id": room_id,
                    "team_id": team_id,
                }

                sessions_to_insert.append(session_data)

        try:
            response = self._make_request(
                "POST", "/sessions", json={"sessions": sessions_to_insert}
            )
            if not response.ok:
                raise SchedulerError("Error in judging sessions request")
            logger.info(
                f"Successfully submitted {len(sessions_to_insert)} judging sessions"
            )
        except requests.RequestException as e:
            logger.error(f"Failed to submit judging sessions: {e}")
            raise SchedulerError("Failed to submit judging sessions.")

    def insert_matches(self, match_schedule: pd.DataFrame):
        logger.debug("Submitting robot game matches to API")

        matches_to_insert = []
        ignore_columns = ["start_time", "end_time", "stage", "round"]

        for index, row in match_schedule.iterrows():
            scheduled_time = row["start_time"]
            stage = row["stage"]
            round_number = row["round"]

            match_data = {
                "number": index,
                "stage": stage,
                "round": round_number,
                "scheduled_time": scheduled_time.isoformat(),
                "tables": {},
            }

            for table_id, _team_slug in row[len(ignore_columns) :].items():
                team_slug = str(_team_slug) if pd.notna(_team_slug) else None
                team_id = self.get_lems_team_id(team_slug) if team_slug else None
                # Extract team number from slug (format: "region-number")
                team_number = int(team_slug.split('-')[1]) if team_slug and '-' in team_slug else None

                match_data["tables"][table_id] = {
                    "team_id": team_id,
                    "team_number": team_number,
                }

            matches_to_insert.append(match_data)

        try:
            response = self._make_request(
                "POST", "/matches", json={"matches": matches_to_insert}
            )
            if not response.ok:
                raise SchedulerError("Error in robot game matches request")
            logger.info(
                f"Successfully submitted {len(matches_to_insert)} robot game matches"
            )
        except requests.RequestException as e:
            logger.error(f"Failed to submit robot game matches: {e}")
            raise SchedulerError("Failed to submit robot game matches")

    def delete_schedule(self):
        """Delete all sessions, matches, and their states for this division."""
        logger.warning("Deleting division schedule")

        try:
            response = self._make_request("DELETE", "/schedule")
            if not response.ok:
                raise SchedulerError("Error in delete schedule request")
            logger.info("Successfully deleted division schedule")
        except requests.RequestException as e:
            logger.error(f"Failed to delete division schedule: {e}")
            raise SchedulerError("Failed to delete division schedule")

    def mark_schedule_complete(self, schedule_settings: dict = None):
        """Mark the division as having a complete schedule."""
        logger.info("Marking schedule as complete")

        payload = {}
        if schedule_settings:
            payload["schedule_settings"] = schedule_settings

        try:
            response = self._make_request("PUT", "/settings", json=payload)
            if not response.ok:
                raise SchedulerError("Error in mark schedule complete request")
            logger.info("Successfully marked schedule as complete")
        except requests.RequestException as e:
            logger.error(f"Failed to mark schedule as complete: {e}")
            raise SchedulerError("Failed to mark schedule as complete")

    def close_connections(self):
        if hasattr(self, "session"):
            self.session.close()
            logger.info("HTTP session closed")
