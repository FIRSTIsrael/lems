import math
import logging
from typing import Iterable, TypedDict, Literal
from datetime import datetime, timedelta

from models.requests.validate_schedule import ValidateScheduleRequest, Break
from repository.lems_repository import LemsRepository

logger = logging.getLogger("lems.scheduler")


MIN_MINUTES_BETWEEN_EVENTS = 15


class ValidatorError(Exception):
    pass


class ValidatorEvent(TypedDict):
    event_type: Literal["match", "judging"]
    number: int
    slots: int
    start_time: datetime
    end_time: datetime


class ValidatorService:

    def __init__(
        self, lems_repository: LemsRepository, request: ValidateScheduleRequest
    ):
        self.lems_repository = lems_repository
        self.config = request
        self.team_count = len(self.lems_repository.get_teams())

    def get_sessions(self):
        judging_start_time = self.config.judging_start
        cycle_time = timedelta(seconds=self.config.judging_cycle_time_seconds)
        rooms = self.lems_repository.get_rooms()
        judging_rounds = math.ceil(self.team_count / len(rooms))

        sessions = []
        current_time = judging_start_time
        for round in range(1, judging_rounds + 1):
            sessions.append(
                {
                    "event_type": "judging",
                    "number": round,
                    "slots": len(rooms),
                    "start_time": current_time,
                    "end_time": current_time + cycle_time,
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

    def get_matches(self):
        total_rounds = self.config.practice_rounds + self.config.ranking_rounds
        tables = self.lems_repository.get_tables()
        slots = math.ceil(
            len(tables) / 2 if self.config.stagger_matches else len(tables)
        )
        matches_per_round = math.ceil(self.team_count / slots)

        rounds = []
        current_time = self.config.matches_start

        for round in range(1, total_rounds + 1):
            start_number = (round - 1) * matches_per_round

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
                    if break_.event_type == "match" and break_.after == match
                )
                break_after = next(breaks, None)
                if break_after:
                    current_time += timedelta(seconds=break_after.duration_seconds)

            rounds.append(matches)

        return rounds

    def validate(self):
        sessions = self.get_sessions()
        rounds_with_matches = self.get_matches()

        round_times = [
            {
                "start_time": round[0]["start_time"],
                "end_time": round[-1]["end_time"],
            }
            for round in rounds_with_matches
        ]

        logger.debug(f"Sessions: {sessions}")
        logger.debug(f"Rounds: {round_times}")

        padding = timedelta(minutes=MIN_MINUTES_BETWEEN_EVENTS)
        potential_overlap_per_session = [
            [
                index
                for (index, round) in enumerate(round_times)
                if round["start_time"] < (session["end_time"] + padding)
                and round["end_time"] > (session["start_time"] - padding)
            ]
            for session in sessions
        ]

        logger.debug(f"Potential overlap per session: {potential_overlap_per_session}")

        for session in sessions:
            overlapping_rounds = potential_overlap_per_session.pop(0)
            available_matches = []

            # TODO: If overlapping rounds is empty, should not go into this loop and should not throw error.
            # Session can be matched with any robot game slot.

            for round_index in overlapping_rounds:
                round = rounds_with_matches[round_index]
                for match in round:
                    if match["start_time"] > (session["end_time"] + padding) or match[
                        "end_time"
                    ] < (session["start_time"] - padding):
                        available_matches.append(match)

            logger.debug(
                f"Session {session['number']} has matches {[match['number'] for match in available_matches]}"
            )

            # available_slots = sum(match["slots"] for match in available_matches)
            # if available_slots < session["slots"]:
            #     raise ValidatorError(
            #         f"Session {session['number']} does not have enough matches to fill all slots"
            #     )

    # TODO: stage 2 validation - check if slots are shared between 2 sessions.
    # In this case we can fail even when the slots check passes.
