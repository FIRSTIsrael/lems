import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface DivisionWithId {
  id: string;
}

interface AgendaArgs {
  visibility?: string[];
}

export interface AgendaEventGraphQL {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
  location: string | null;
}

/**
 * Resolver for Division.agenda field.
 * Fetches all agenda events for a division, optionally filtered by visibility.
 * @param division - The division object containing the id
 * @param args - Optional arguments to filter results
 * @param args.visibility - Filter by visibility types (e.g., ['public', 'judging'])
 */
export const divisionAgendaResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  AgendaArgs,
  Promise<AgendaEventGraphQL[]>
> = async (division: DivisionWithId, args: AgendaArgs) => {
  try {
    let agendaEvents = await db.divisions.byId(division.id).agenda().getAll();

    if (args?.visibility && args.visibility.length > 0) {
      agendaEvents = agendaEvents.filter(event => args.visibility!.includes(event.visibility));
    }

    return agendaEvents.map(event => ({
      id: event.id,
      title: event.title,
      startTime: event.start_time.toISOString(),
      duration: event.duration,
      visibility: event.visibility,
      location: event.location || undefined
    }));
  } catch (error) {
    console.error('Error fetching agenda events for division:', division.id, error);
    throw error;
  }
};
