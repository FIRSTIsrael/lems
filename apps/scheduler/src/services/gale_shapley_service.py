from typing import List, Tuple, Callable, Optional

from apps.scheduler.src.events.judging_room import JudgingRoom
from apps.scheduler.src.events.match import Match
from apps.scheduler.src.events.practice_match import PracticeMatch
from apps.scheduler.src.models.event_type import EventType
from apps.scheduler.src.models.session import Session
from apps.scheduler.src.models.team import Team


def get_session_preference_function(session: Session) -> Callable:
    type_to_function = {
        EventType.JUDGING_ROOM : JudgingRoom.calculate_preference,
        EventType.MATCH : Match.calculate_preference,
        EventType.PRACTICE_MATCH : PracticeMatch.calculate_preference
    }

    return type_to_function[session.event_type]


def get_best_team_match(session: Session, teams: List[Team], preference_function: Callable) -> Team:
    best_team = teams[0]
    best_score = preference_function(session, best_team)

    for team in teams:
        current_score = preference_function(session, team)
        if current_score > best_score:
            best_score = current_score
            best_team = team

    return best_team


def team_minimum_time(sessions: List[Session]) -> int:
    minimum_time = 120
    for first_session in sessions:
        for second_session in sessions:
            if first_session != second_session:
                if first_session.end_time > second_session.start_time > first_session.start_time:
                    return 0
                current_time_difference = first_session.end_time - second_session.start_time
                minutes_difference = current_time_difference.total_seconds() / 60
                if 0 < minutes_difference < minimum_time:
                    minimum_time = minutes_difference
    return minimum_time


def check_team_preference(team: Team, session: Session) -> Optional[Session]:
    current_event_session_index = session.event_index
    team_current_event_session = None

    for team_session in team.team_events:
        if team_session.event_index == current_event_session_index:
            team_current_event_session = team_session

    if team_current_event_session is None:
        team.team_events.append(session)
        session.team_number = team.team_number
        return

    current_sessions = team.team_events
    current_score = team_minimum_time(current_sessions)

    modified_sessions = team.team_events.copy()
    modified_sessions.remove(team_current_event_session)
    modified_sessions.append(session)
    modified_score = team_minimum_time(modified_sessions)

    if modified_score > current_score:
        team_current_event_session.rejected_teams.append(team.team_number)
        team_current_event_session.team_number = 0
        team.team_events = modified_sessions
        return team_current_event_session
    else:
        session.rejected_teams.append(team.team_number)
        return session


def gale_shapley(teams: List[Team], sessions: List[Session]) -> Tuple[List[Team], List[Session]]:
    sessions_left = sessions.copy()
    amount_of_sessions_left = len(sessions_left)

    while amount_of_sessions_left > 0:
        current_session = sessions_left.pop()
        session_preference_function = get_session_preference_function(current_session)
        current_team = get_best_team_match(current_session, teams, session_preference_function)
        session_left_alone = check_team_preference(current_team, current_session)
        if session_left_alone is not None:
            sessions_left.append(session_left_alone)
        amount_of_sessions_left = len(sessions_left)

    return teams, sessions
