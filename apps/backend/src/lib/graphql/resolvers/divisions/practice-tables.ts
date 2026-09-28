import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';

interface Division {
  id: string;
}

export const divisionPracticeTablesResolver: GraphQLFieldResolver<
  Division,
  GraphQLContext
> = async parent => {
  // Return an object with divisionId that will be used by child resolvers
  return {
    divisionId: parent.id
  };
};
