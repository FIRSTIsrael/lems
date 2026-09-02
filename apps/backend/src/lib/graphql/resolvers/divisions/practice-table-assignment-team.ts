import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTableAssignmentGraphQL {
  teamId: string;
}

export const practiceTableAssignmentTeamResolver: GraphQLFieldResolver<
  PracticeTableAssignmentGraphQL,
  GraphQLContext
> = async assignment => {
  const team = await db.teams.byId(assignment.teamId).get();

  if (!team) {
    throw new Error(`Team ${assignment.teamId} not found`);
  }

  return {
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation
  };
};
