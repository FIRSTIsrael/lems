import { GraphQLFieldResolver } from 'graphql';
import { pubsub } from '../pubsub';
import { SubscriptionContext } from '../types';

interface TeamArrivalPayload {
  teamId: string;
  divisionId: string;
  arrived: boolean;
  updatedAt: string;
}

/**
 * Subscription resolver for team arrival updates
 * Clients subscribe to receive real-time updates when team arrival status changes
 * The divisionId is automatically scoped from the WebSocket connection context
 */
export const teamArrivalUpdatedResolver: GraphQLFieldResolver<
  unknown,
  SubscriptionContext,
  Record<string, never>
> = (_, _args, context) => {
  const divisionId = context.divisionId;

  if (!divisionId) {
    throw new Error('No division context available. Connection must include divisionId.');
  }

  const channel = pubsub.divisionChannel(divisionId, 'teamArrivalUpdated');

  // Return an async iterator that yields values when events are published
  return {
    [Symbol.asyncIterator]: async function* () {
      const queue: TeamArrivalPayload[] = [];
      let resolveNext: ((value: IteratorResult<TeamArrivalPayload>) => void) | null = null;

      // Subscribe to the PubSub channel
      const subscription = pubsub.subscribe<TeamArrivalPayload>(channel, payload => {
        if (resolveNext) {
          resolveNext({ value: payload, done: false });
          resolveNext = null;
        } else {
          queue.push(payload);
        }
      });

      try {
        while (true) {
          if (queue.length > 0) {
            yield queue.shift()!;
          } else {
            yield await new Promise<TeamArrivalPayload>(resolve => {
              resolveNext = result => {
                if (!result.done) {
                  resolve(result.value);
                }
              };
            });
          }
        }
      } finally {
        // Clean up subscription when client disconnects
        subscription.unsubscribe();
      }
    }
  };
};
