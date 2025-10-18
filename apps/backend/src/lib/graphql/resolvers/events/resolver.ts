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

async function mapEventToGraphQL(event: Event): Promise<EventGraphQL> {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate: event.start_date.toISOString(),
    endDate: event.end_date.toISOString()
  };
}

export const eventResolvers = {
  Query: {
    events: (async (_parent, args: EventsArgs) => {
      try {
        // Build base query
        let query = db.raw.sql
          .selectFrom('events')
          .leftJoin('divisions', 'divisions.event_id', 'events.id')
          .select([
            'events.id',
            'events.slug',
            'events.name',
            'events.start_date',
            'events.end_date'
          ])
          .select(
            sql<boolean>`COALESCE(BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule), false)`.as(
              'is_fully_set_up'
            )
          )
          .groupBy([
            'events.id',
            'events.slug',
            'events.name',
            'events.start_date',
            'events.end_date'
          ]);

        // Apply date filters at database level
        if (args.startAfter) {
          const startAfter = dayjs(args.startAfter).toDate();
          query = query.where('events.start_date', '>', startAfter);
        }

        if (args.startBefore) {
          const startBefore = dayjs(args.startBefore).toDate();
          query = query.where('events.start_date', '<', startBefore);
        }

        if (args.endAfter) {
          const endAfter = dayjs(args.endAfter).toDate();
          query = query.where('events.end_date', '>', endAfter);
        }

        if (args.endBefore) {
          const endBefore = dayjs(args.endBefore).toDate();
          query = query.where('events.end_date', '<', endBefore);
        }

        // Apply fullySetUp filter at database level using HAVING
        if (args.fullySetUp !== undefined) {
          const condition = args.fullySetUp
            ? sql<boolean>`BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule) = true`
            : sql<boolean>`COALESCE(BOOL_AND(divisions.has_awards AND divisions.has_users AND divisions.has_schedule), false) = false`;
          query = query.having(condition);
        }

        query = query.orderBy('events.start_date', 'asc');

        const results = await query.execute();

        // Map to GraphQL format - ensure we always return an array
        return (
          results?.map(row => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            startDate: row.start_date.toISOString(),
            endDate: row.end_date.toISOString()
          })) || []
        );
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    }) as GraphQLFieldResolver<unknown, unknown, EventsArgs, Promise<EventGraphQL[]>>,

    event: (async (_parent, args: EventArgs) => {
      if (!args.id && !args.slug) {
        throw new Error('Either id or slug must be provided');
      }

      let event: Event | undefined;

      if (args.id) {
        event = await db.events.byId(args.id).get();
      } else if (args.slug) {
        event = await db.events.bySlug(args.slug).get();
      }

      if (!event) return null;

      return mapEventToGraphQL(event);
    }) as GraphQLFieldResolver<unknown, unknown, EventArgs, Promise<EventGraphQL | null>>
  }
};
