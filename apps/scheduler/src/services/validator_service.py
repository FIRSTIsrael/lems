import math
import logging
from typing import Iterable
from datetime import timedelta

from models.validator import (
    ValidatorData,
    ValidatorMatch,
    ValidatorSession,
)
from models.errors import ValidatorError
from models.requests import SchedulerRequest, Break
from repository.lems_repository import LemsRepository
from config import MIN_MINUTES_BETWEEN_EVENTS

logger = logging.getLogger("lems.scheduler")


class ValidatorService:

    def __init__(self, lems_repository: LemsRepository, request: SchedulerRequest):
        self.lems_repository = lems_repository
        self.config = request
        self.team_count = len(self.lems_repository.get_teams())
        self._sessions = self._get_sessions()
        self._matches = self._get_matches()
        self.padding = timedelta(minutes=MIN_MINUTES_BETWEEN_EVENTS)

    @property
    def sessions(self) -> list[ValidatorSession]:
        """Read-only property for sessions"""
        return self._sessions.copy()

    @property
    def matches(self) -> list[list[ValidatorMatch]]:
        """Read-only property for matches"""
        return [round.copy() for round in self._matches]

    def _get_sessions(self) -> list[ValidatorSession]:
        judging_start_time = self.config.judging_start
        event_length = timedelta(seconds=self.config.judging_session_length_seconds)
        cycle_time = timedelta(seconds=self.config.judging_cycle_time_seconds)
        rooms = self.lems_repository.get_rooms()
        judging_rounds = math.ceil(self.team_count / len(rooms))

        sessions: list[ValidatorSession] = []
        current_time = judging_start_time
        for round in range(1, judging_rounds + 1):
            sessions.append(
                {
                    "event_type": "judging",
                    "number": round,
                    "slots": len(rooms),
                    "start_time": current_time,
                    # We don't use cycle time since rubrics are filled out after the session ends
                    "end_time": current_time + event_length,
                }
            )
            current_time += cycle_time

            breaks: Iterable[Break] = (
                break_
                for break_ in self.config.breaks
                if break_.event_type == "judging" and break_.after == round
            )
            break_after = next(breaks, None)
            if break_after:
                current_time += timedelta(seconds=break_after.duration_seconds)

        return sessions

    def _get_matches(self) -> list[list[ValidatorMatch]]:
        total_rounds = self.config.practice_rounds + self.config.ranking_rounds
        tables = self.lems_repository.get_tables()
        slots = math.ceil(
            len(tables) / 2 if self.config.stagger_matches else len(tables)
        )
        matches_per_round = math.ceil(self.team_count / slots)

        rounds: list[list[ValidatorMatch]] = []
        current_time = self.config.matches_start

        for round in range(1, total_rounds + 1):
            start_number = (round - 1) * matches_per_round
            stage = "practice" if round <= self.config.practice_rounds else "ranking"
            round_number = (
                round if stage == "practice" else round - self.config.practice_rounds
            )

            cycle_time = (
                timedelta(seconds=self.config.practice_match_cycle_time_seconds)
                if round <= self.config.practice_rounds
                else timedelta(seconds=self.config.ranking_match_cycle_time_seconds)
            )

            matches = []
            for match in range(1, matches_per_round + 1):
                matches.append(
                    {
                        "event_type": "match",
                        "stage": stage,
                        "round": round_number,
                        "number": start_number + match,
                        "slots": slots,
                        "start_time": current_time,
                        "end_time": current_time + cycle_time,
                    }
                )
                current_time += cycle_time

                breaks: Iterable[Break] = (
                    break_
                    for break_ in self.config.breaks
                    if break_.event_type == "match"
                    and break_.after == (start_number + match)
                )
                break_after = next(breaks, None)
                if break_after:
                    current_time += timedelta(seconds=break_after.duration_seconds)

            rounds.append(matches)

        return rounds

    def _get_potential_round_overlaps(self, session: ValidatorSession):
        """Returns the rounds that overlap with the session's time window."""

        rounds_with_matches = self.matches

        round_times = [
            {
                "start_time": round[0]["start_time"],
                "end_time": round[-1]["end_time"],
            }
            for round in rounds_with_matches
        ]

        overlaps = [
            index
            for (index, round) in enumerate(round_times)
            if round["start_time"] < (session["end_time"] + self.padding)
            and round["end_time"] > (session["start_time"] - self.padding)
        ]

        return overlaps

    def _get_optional_matches(self, session: ValidatorSession):
        """Returns the matches that are available for each team in the session.
        A match is available if it doesn't overlap with the session's time window.
        """

        overlaps = self._get_potential_round_overlaps(session=session)
        logger.debug(f"Session {session['number']} overlaps with rounds {overlaps}")

        available_matches = []

        if len(overlaps) == 0:
            return None

        for round_index in overlaps:
            round = self.matches[round_index]
            for match in round:
                if match["start_time"] >= (session["end_time"] + self.padding) or match[
                    "end_time"
                ] < (session["start_time"] - self.padding):
                    available_matches.append(match)

        avaliable_match_numbers = [match["number"] for match in available_matches]

        logger.debug(
            f"Session {session['number']} has matches {avaliable_match_numbers}"
        )

        return avaliable_match_numbers

    def _create_validator_data(self) -> list[ValidatorData]:
        """Creates the data structure for the validator to use.
        This is a list of sessions, each with a list of overlapping rounds."""

        data = []
        for session in self.sessions:
            optional_matches = self._get_optional_matches(session)
            if optional_matches is None:
                continue

            overlapping_rounds = []
            for round_index in self._get_potential_round_overlaps(session):
                round = self.matches[round_index]
                round_number = round_index + 1
                overlapping_rounds.append(
                    {
                        "stage": (
                            "practice"
                            if round_index < self.config.practice_rounds
                            else "ranking"
                        ),
                        "number": (
                            round_number - self.config.practice_rounds
                            if round_number > self.config.practice_rounds
                            else round_number
                        ),
                        "start_time": round[0]["start_time"],
                        "end_time": round[-1]["end_time"],
                        "available_matches": [
                            match
                            for match in round
                            if match["number"] in optional_matches
                        ],
                    }
                )

            data.append(
                {
                    "session": session,
                    "overlapping_rounds": overlapping_rounds,
                }
            )

        return data

    def _cross_reference_match_slots(self, data: list[ValidatorData]):
        """Handles cases where multiple sessions have the same available match.
        Known unhandles cases: Splitting the slots of a shared session between 2 matches.
        """

        match_numbers = []
        for entry in data:
            for overlapping_round in entry["overlapping_rounds"]:
                for match in overlapping_round["available_matches"]:
                    match_numbers.append(match["number"])

        duplicate_matches = {
            match_number
            for match_number in match_numbers
            if match_numbers.count(match_number) > 1
        }

        duplicate_match_details = {}
        for match_number in duplicate_matches:
            sessions = []
            for entry in data:
                for overlapping_round in entry["overlapping_rounds"]:
                    for match in overlapping_round["available_matches"]:
                        if match["number"] == match_number:
                            sessions.append(
                                {
                                    "session": entry["session"]["number"],
                                    "slots": sum(
                                        match["slots"]
                                        for match in overlapping_round[
                                            "available_matches"
                                        ]
                                    ),
                                }
                            )

            duplicate_match_details[match_number] = sessions

            min_slots = min(sessions, key=lambda x: x["slots"])["slots"]
            first_min_session = next(
                s["session"] for s in sessions if s["slots"] == min_slots
            )

            for entry in data:
                for overlapping_round in entry["overlapping_rounds"]:
                    overlapping_round["available_matches"] = [
                        match
                        for match in overlapping_round["available_matches"]
                        if match["number"] != match_number
                        or entry["session"]["number"] == first_min_session
                    ]

        if len(duplicate_matches) > 0:
            logger.debug(f"Duplicate matches: {duplicate_match_details}")
            logger.info(
                f"Schedule has duplicate available matches: {duplicate_matches}"
            )

        return data

    def validate(self):
        data = self._create_validator_data()
        self._cross_reference_match_slots(data)  # Modifies in place

        for entry in data:
            for overlapping_round in entry["overlapping_rounds"]:
                slots = sum(
                    match["slots"] for match in overlapping_round["available_matches"]
                )
                if slots < entry["session"]["slots"]:
                    raise ValidatorError(
                        f"Session {entry['session']['number']} does not have enough matches to fill all slots",
                        data,
                    )

        return data
