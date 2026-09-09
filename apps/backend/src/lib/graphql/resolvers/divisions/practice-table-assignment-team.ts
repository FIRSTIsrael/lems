import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTableSlotGraphQL {
  teamId: string | null;
}

export const practiceTableAssignmentTeamResolver: GraphQLFieldResolver<
  PracticeTableSlotGraphQL,
  GraphQLContext
> = async slot => {
  // Return null if no team is assigned to this slot
  if (!slot.teamId) {
    return null;
  }

  const team = await db.teams.byId(slot.teamId).get();

  if (!team) {
    throw new Error(`Team ${slot.teamId} not found`);
  }

  return {
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation
  };
};
