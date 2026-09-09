import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface Division {
  id: string;
}

export const divisionPracticeTablesConfigResolver: GraphQLFieldResolver<
  Division,
  GraphQLContext
> = async parent => {
  const division = await db.raw.sql
    .selectFrom('divisions')
    .where('id', '=', parent.id)
    .select('practice_tables_settings')
    .executeTakeFirst();

  if (!division || !division.practice_tables_settings) {
    return null;
  }

  const settings = division.practice_tables_settings as unknown as Record<string, unknown>;

  return {
    divisionId: parent.id,
    tableCount: settings.tableCount as number,
    slotDurationMinutes: settings.slotDurationMinutes as number,
    startTime: settings.startTime as string,
    endTime: settings.endTime as string,
    blockedTimeSlots: (settings.blockedTimeSlots as Array<Record<string, unknown>>) || []
  };
};
