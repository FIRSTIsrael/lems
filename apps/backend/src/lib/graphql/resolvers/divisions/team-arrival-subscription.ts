import { GraphQLFieldResolver } from 'graphql';
import { PubSub } from '../../websocket/pubsub';

interface TeamArrivalSubscriptionArgs {
  divisionId: string;
}

interface TeamArrivalPayload {
  teamId: string;
  divisionId: string;
  arrived: boolean;
  updatedAt: string;
}

/**
 * Subscription resolver for team arrival updates
 * Clients subscribe to receive real-time updates when team arrival status changes
 */
export const teamArrivalUpdatedResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  TeamArrivalSubscriptionArgs
> = (_, args) => {
  const { divisionId } = args;
  const channel = PubSub.divisionChannel(divisionId, 'teamArrivalUpdated');

  // Return an async iterator that yields values when events are published
  return {
    [Symbol.asyncIterator]: async function* () {
      const queue: TeamArrivalPayload[] = [];
      let resolveNext: ((value: IteratorResult<TeamArrivalPayload>) => void) | null = null;

      // Get the pubsub instance
      const { pubsub } = await import('../../websocket/pubsub');

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
