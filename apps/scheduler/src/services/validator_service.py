import math
import logging
from typing import Iterable
from datetime import timedelta

from models.validator import ValidatorData, ValidatorMatch, ValidatorSession
from models.requests.validate_schedule import ValidateScheduleRequest, Break
from repository.lems_repository import LemsRepository

logger = logging.getLogger("lems.scheduler")


MIN_MINUTES_BETWEEN_EVENTS = 15


class ValidatorService:

    def __init__(
        self, lems_repository: LemsRepository, request: ValidateScheduleRequest
    ):
        self.lems_repository = lems_repository
        self.config = request
        self.team_count = len(self.lems_repository.get_teams())
        self.sessions = self.get_sessions()
        self.matches = self.get_matches()
        self.padding = timedelta(minutes=MIN_MINUTES_BETWEEN_EVENTS)

    def get_sessions(self) -> list[ValidatorSession]:
        judging_start_time = self.config.judging_start
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

    def get_matches(self) -> list[list[ValidatorMatch]]:
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

    def get_potential_match_overlaps(self, session: ValidatorSession):
        rounds_with_matches = self.matches

        round_times = [
            {
                "start_time": round[0]["start_time"],
                "end_time": round[-1]["end_time"],
            }
            for round in rounds_with_matches
        ]

        return [
            index
            for (index, round) in enumerate(round_times)
            if round["start_time"] < (session["end_time"] + self.padding)
            and round["end_time"] > (session["start_time"] - self.padding)
        ]

    def get_optional_matches(self, session: ValidatorSession):
        potential_overlaps = self.get_potential_match_overlaps(session=session)

        available_matches = []

        if len(potential_overlaps) == 0:
            return

        for round_index in potential_overlaps:
            round = self.matches[round_index]
            for match in round:
                if match["start_time"] > (session["end_time"] + self.padding) or match[
                    "end_time"
                ] < (session["start_time"] - self.padding):
                    available_matches.append(match)

        avaliable_match_numbers = [match["number"] for match in available_matches]

        logger.debug(
            f"Session {session['number']} has matches {avaliable_match_numbers}"
        )

        # available_slots = sum(match["slots"] for match in available_matches)
        # if available_slots < session["slots"]:
        #     raise ValidatorError(
        #         f"Session {session['number']} does not have enough matches to fill all slots"
        #     )
        return avaliable_match_numbers

    def create_validator_data(self) -> list[ValidatorData]:
        data = []
        for session in self.sessions:
            optional_matches = self.get_optional_matches(session)
            if not optional_matches:
                continue

            overlapping_rounds = []
            for round_index in self.get_potential_match_overlaps(session):
                round = self.matches[round_index]
                overlapping_rounds.append(
                    {
                        "stage": (
                            "practice"
                            if round_index < self.config.practice_rounds
                            else "ranking"
                        ),
                        "number": round_index + 1,
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

    def validate(self):
        data = self.create_validator_data()
        # for session in self.sessions:
        #     optional_matches = self.get_optional_matches(session)
        #     if not optional_matches:
        #         raise ValidatorError(
        #             f"Session {session['number']} does not have any available matches"
        #         )
        return data
        # TODO: stage 2 validation - check if slots are shared between 2 sessions.
        # In this case we can fail even when the slots check passes
