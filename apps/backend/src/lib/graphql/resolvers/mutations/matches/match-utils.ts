import dayjs from 'dayjs';
import { RobotGameMatchState } from '@lems/database';
import { MATCH_LOAD_THRESHOLD } from '@lems/shared/consts';
import db from '../../../../database';


/**
 * Finds the next unstarted match in the current stage that should be auto-loaded
 * A match is eligible if it starts within AUTO_LOAD_THRESHOLD_MINUTES
 *
 * @param divisionId - The division ID
 * @param currentStage - The current match stage
 * @returns The ID of the match to auto-load, or null if none is eligible
 */
export async function getAutoLoadMatch(divisionId: string, currentStage: string): Promise<string | null> {
  const allMatches = await db.robotGameMatches.byDivision(divisionId).getAll();
  const divisionMatches = allMatches
    .filter(match => match.stage === currentStage)
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  for (const candidateMatch of divisionMatches) {
    const candidateState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId: candidateMatch.id });

    if (candidateState?.status === 'not-started') {
      const scheduledTime = dayjs(candidateMatch.scheduled_time);
      const minutesUntilStart = scheduledTime.diff(dayjs(), 'minute', true);

      if (minutesUntilStart <= MATCH_LOAD_THRESHOLD) {
        return candidateMatch.id;
      }
    }
  }

  return null;
}
