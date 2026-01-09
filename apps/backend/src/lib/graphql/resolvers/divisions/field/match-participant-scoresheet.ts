import { GraphQLFieldResolver } from 'graphql';
import { Scoresheet } from '@lems/database';
import db from '../../../../database';
import { buildScoresheetResult, ScoresheetGraphQL } from '../../../utils/scoresheet-builder';

interface ParticipantWithMatchContext {
  teamId: string | null;
  divisionId: string;
  matchId: string;
}

/**
 * Resolver for MatchParticipant.scoresheet field.
 * Fetches the scoresheet for the participant's team for the specific match.
 * Returns null if the participant has no team assigned or if no scoresheet exists.
 */
export const matchParticipantScoresheetResolver: GraphQLFieldResolver<
  ParticipantWithMatchContext,
  unknown,
  unknown,
  Promise<ScoresheetGraphQL | null>
> = async (participant: ParticipantWithMatchContext) => {
  // No team = no scoresheet
  if (!participant.teamId) {
    return null;
  }

  try {
    // Get the match to determine stage and round
    const match = await db.robotGameMatches.byId(participant.matchId).get();

    if (!match) {
      console.error('Match not found for participant scoresheet:', participant.matchId);
      return null;
    }

    // Only PRACTICE and RANKING matches have scoresheets
    if (match.stage === 'TEST') {
      return null;
    }

    // Query for the scoresheet matching this team, stage, and round
    const mongo = db.raw.mongo;
    const scoresheet = await mongo.collection<Scoresheet>('scoresheets').findOne({
      divisionId: participant.divisionId,
      teamId: participant.teamId,
      stage: match.stage,
      round: match.round
    });

    if (!scoresheet) {
      return null;
    }

    return buildScoresheetResult(scoresheet);
  } catch (error) {
    console.error(
      'Error fetching scoresheet for participant:',
      participant.teamId,
      participant.matchId,
      error
    );
    return null;
  }
};
