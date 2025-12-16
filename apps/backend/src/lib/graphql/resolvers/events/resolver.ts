import { GraphQLFieldResolver } from 'graphql';
import { sql } from 'kysely';
import dayjs from 'dayjs';
import { Event } from '@lems/database';
import db from '../../../database';

export interface EventGraphQL {
  id: string;
  slug: string;
  name: string;
  startDate: string;
  endDate: string;
  region: string;
  isFullySetUp?: boolean;
}

interface EventArgs {
  id?: string;
  slug?: string;
}

interface EventsArgs {
  fullySetUp?: boolean;
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
}

interface DivisionVenueArgs {
  id: string;
}

export interface DivisionVenue {
  id: string;
  tables: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
}

export const eventResolvers = {
  Query: {
    events: (async (_parent, args: EventsArgs) => {
      try {
        const results = await buildEventQuery(args).execute();
        return results?.map(row => buildResult(row)) || [];
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    }) as GraphQLFieldResolver<unknown, unknown, EventsArgs, Promise<EventGraphQL[]>>,

    event: (async (_parent, args: EventArgs) => {
      if (!args.id && !args.slug) {
        throw new Error('Either id or slug must be provided');
      }

      try {
        const event = args.id
          ? await db.events.byId(args.id).get()
          : await db.events.bySlug(args.slug!).get();

        return event ? buildResult(event) : null;
      } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
      }
    }) as GraphQLFieldResolver<unknown, unknown, EventArgs, Promise<EventGraphQL | null>>,

    divisionVenue: (async (_parent, args: DivisionVenueArgs) => {
      if (!args.id) {
        throw new Error('Division ID is required');
      }

      try {
        const division = await db.divisions.byId(args.id).get();

        if (!division) {
          throw new Error(`Division with ID ${args.id} not found`);
        }

        const tables = await db.tables.byDivisionId(args.id).getAll();
        const rooms = await db.rooms.byDivisionId(args.id).getAll();

        return {
          id: division.id,
          tables: tables.map(t => ({ id: t.id, name: t.name })),
          rooms: rooms.map(r => ({ id: r.id, name: r.name }))
        };
      } catch (error) {
        console.error('Error fetching division venue:', error);
        throw error;
      }
    }) as GraphQLFieldResolver<unknown, unknown, DivisionVenueArgs, Promise<DivisionVenue>>
  }
};

/**
 * Builds a Kysely query with optional date filters for event queries.
 */
function buildEventQuery(args: EventsArgs) {
  let query = db.raw.sql
    .selectFrom('events')
    .leftJoin('divisions', 'divisions.event_id', 'events.id')
    .select(['events.id', 'events.slug', 'events.name', 'events.start_date', 'events.end_date', 'events.region'])
    .select(
      sql<boolean>`COALESCE(BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule), false)`.as(
        'is_fully_set_up'
      )
    )
    .groupBy(['events.id', 'events.slug', 'events.name', 'events.start_date', 'events.end_date', 'events.region']);

  // Apply date filters
  if (args.startAfter) {
    query = query.where('events.start_date', '>=', dayjs(args.startAfter).toDate());
  }
  if (args.startBefore) {
    query = query.where('events.start_date', '<=', dayjs(args.startBefore).toDate());
  }
  if (args.endAfter) {
    query = query.where('events.end_date', '>=', dayjs(args.endAfter).toDate());
  }
  if (args.endBefore) {
    query = query.where('events.end_date', '<=', dayjs(args.endBefore).toDate());
  }

  // Apply fullySetUp filter
  if (args.fullySetUp !== undefined) {
    const condition = args.fullySetUp
      ? sql<boolean>`BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule) = true`
      : sql<boolean>`COALESCE(BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule), false) = false`;
    query = query.having(condition);
  }

  return query.orderBy('events.start_date', 'asc');
}

/**
 * Maps database Event to GraphQL EventGraphQL type.
 * Converts database date format to ISO strings for GraphQL.
 * Optionally includes isFullySetUp if provided (e.g., from aggregated queries).
 */
function buildResult(event: Partial<Event> & { is_fully_set_up?: boolean }): EventGraphQL {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate: event.start_date.toISOString(),
    endDate: event.end_date.toISOString(),
    region: event.region,
    isFullySetUp: event.is_fully_set_up,
  };
}
