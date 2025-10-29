# LEMS Real-time Networking Framework - Backend Implementation

## Overview

This document describes the backend implementation of the LEMS real-time networking framework, which provides a robust GraphQL-based subscription system for real-time updates across the application.

## Architecture

### Core Components

1. **GraphQL Schema** (`apps/backend/src/lib/graphql/index.ts`)
   - Defines queries, mutations, and subscriptions
   - Currently implements team arrival status management

2. **PubSub System** (`apps/backend/src/lib/pubsub.ts`)
   - Lightweight publish/subscribe system for event broadcasting
   - Division-scoped channels for data isolation
   - Memory-efficient with automatic cleanup

3. **WebSocket Server** (`apps/backend/src/lib/graphql-ws-server.ts`)
   - Production-ready GraphQL WebSocket server using `graphql-ws` protocol
   - Handles connection lifecycle, authentication, and error handling
   - Graceful shutdown support

4. **Resolvers** (`apps/backend/src/lib/graphql/resolvers/divisions/`)
   - Query resolvers for fetching data
   - Mutation resolvers for updating data and publishing events
   - Subscription resolvers for real-time updates

## Team Arrival Status Example

### GraphQL Schema

#### Query
```graphql
type Query {
  division(id: ID!): Division
}

type Division {
  id: ID!
  teams: [Team!]!
}

type Team {
  id: ID!
  arrived: Boolean!
}
```

#### Mutation
```graphql
type Mutation {
  updateTeamArrival(
    divisionId: ID!
    teamId: ID!
    arrived: Boolean!
  ): TeamArrivalPayload!
}

type TeamArrivalPayload {
  teamId: ID!
  divisionId: ID!
  arrived: Boolean!
  updatedAt: String!
}
```

#### Subscription
```graphql
type Subscription {
  teamArrivalUpdated(divisionId: ID!): TeamArrivalPayload!
}
```

### Usage Flow

1. **Client connects** to WebSocket at `ws://localhost:3333/graphql/ws`
   - Provides `divisionId` in connection params
   - Connection is authenticated and authorized

2. **Client subscribes** to team arrival updates:
   ```graphql
   subscription {
     teamArrivalUpdated(divisionId: "division-123") {
       teamId
       divisionId
       arrived
       updatedAt
     }
   }
   ```

3. **Client updates** team arrival status:
   ```graphql
   mutation {
     updateTeamArrival(
       divisionId: "division-123"
       teamId: "team-456"
       arrived: true
     ) {
       teamId
       arrived
       updatedAt
     }
   }
   ```

4. **All subscribed clients** in the same division receive the update immediately

## Data Flow

```
┌─────────────┐
│   Client A  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Mutation: updateTeamArrival
       ▼
┌─────────────────────────────────────┐
│  GraphQL Mutation Resolver          │
│  - Validates input                  │
│  - Updates database                 │
│  - Publishes event to PubSub        │
└──────┬──────────────────────────────┘
       │
       │ 2. Event: teamArrivalUpdated
       ▼
┌─────────────────────────────────────┐
│  PubSub System                      │
│  - Channel: division:123:teamArrival│
│  - Broadcasts to all subscribers    │
└──────┬──────────────────────────────┘
       │
       │ 3. Event delivered
       ├─────────────┬────────────┐
       ▼             ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client A │  │ Client B │  │ Client C │
│(Pit Admin)  │(Audience)│  │(Judging) │
└──────────┘  └──────────┘  └──────────┘
```

## Division Isolation

The system enforces strict division isolation:

- Clients must specify `divisionId` when connecting
- Subscriptions are scoped to a specific division
- PubSub channels use the format: `division:{divisionId}:{eventType}`
- Mutations validate division access (TODO: implement with auth)

## Production Considerations

### Scalability
- **Current implementation**: In-memory PubSub (single server)
- **For production scale**: Consider Redis-based PubSub for multi-server deployments
- WebSocket connections are lightweight and can handle thousands of concurrent clients

### Reliability
- Database is the single source of truth
- Clients should revalidate on reconnection
- Graceful shutdown ensures clean connection closure
- Error boundaries prevent cascading failures

### Security
- **TODO**: Implement authentication middleware
- **TODO**: Implement role-based field permissions
- Connection params validation prevents unauthorized access
- Division-scoped channels prevent cross-division data leaks

### Monitoring
- Connection count tracking
- Subscription lifecycle logging
- Error logging with context
- **TODO**: Add metrics (Prometheus/Grafana)

## Adding New Subscriptions

To add a new real-time feature:

1. **Create the payload type** in `apps/backend/src/lib/graphql/types/`
   ```typescript
   export const MyEventPayloadType = new GraphQLObjectType({
     name: 'MyEventPayload',
     fields: () => ({
       // Define fields
     })
   });
   ```

2. **Create the mutation resolver** in `apps/backend/src/lib/graphql/resolvers/`
   ```typescript
   export const myMutationResolver: GraphQLFieldResolver = async (_, args) => {
     // Update database
     const result = await db.raw.sql...
     
     // Publish event
     const channel = pubsub.divisionChannel(divisionId, 'myEvent');
     pubsub.publish(channel, payload);
     
     return payload;
   };
   ```

3. **Create the subscription resolver**
   ```typescript
   export const myEventSubscriptionResolver: GraphQLFieldResolver = (_, args) => {
     const channel = pubsub.divisionChannel(args.divisionId, 'myEvent');
     return createAsyncIterator(channel);
   };
   ```

4. **Update the schema** in `apps/backend/src/lib/graphql/index.ts`
   ```typescript
   const MutationType = new GraphQLObjectType({
     fields: {
       myMutation: {
         type: MyEventPayloadType,
         args: { /* ... */ },
         resolve: myMutationResolver
       }
     }
   });
   
   const SubscriptionType = new GraphQLObjectType({
     fields: {
       myEventSubscription: {
         type: MyEventPayloadType,
         args: { divisionId: { type: new GraphQLNonNull(GraphQLString) } },
         subscribe: myEventSubscriptionResolver
       }
     }
   });
   ```

## Testing

### Manual Testing with GraphQL Playground

1. Start the server: `npm run serve`
2. For queries/mutations: Use `http://localhost:3333/lems/gql/v1`
3. For subscriptions: Use WebSocket client like Postman or GraphQL Playground

### Example Subscription Test (JavaScript)
```javascript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'ws://localhost:3333/graphql/ws',
  connectionParams: {
    divisionId: 'test-division-id'
  }
});

client.subscribe(
  {
    query: `
      subscription {
        teamArrivalUpdated(divisionId: "test-division-id") {
          teamId
          arrived
          updatedAt
        }
      }
    `
  },
  {
    next: (data) => console.log('Received:', data),
    error: (error) => console.error('Error:', error),
    complete: () => console.log('Complete')
  }
);
```

## Next Steps (Frontend)

1. Create React hooks for GraphQL subscriptions
2. Implement automatic reconnection logic
3. Add optimistic updates for better UX
4. Implement connection status indicator
5. Add revalidation on focus/reconnect
6. Create typed GraphQL client with codegen

## Files Modified/Created

- ✅ `apps/backend/src/lib/pubsub.ts` - PubSub system
- ✅ `apps/backend/src/lib/graphql-ws-server.ts` - WebSocket server
- ✅ `apps/backend/src/lib/graphql/index.ts` - GraphQL schema with mutations and subscriptions
- ✅ `apps/backend/src/lib/graphql/types/divisions/team-arrival.ts` - TeamArrivalPayload type
- ✅ `apps/backend/src/lib/graphql/resolvers/divisions/update-team-arrival.ts` - Mutation resolver
- ✅ `apps/backend/src/lib/graphql/resolvers/divisions/team-arrival-subscription.ts` - Subscription resolver
- ✅ `apps/backend/src/main.ts` - Server initialization with WebSocket support

## References

- [GraphQL Subscriptions](https://graphql.org/learn/subscriptions/)
- [graphql-ws Protocol](https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md)
- [graphql-ws Documentation](https://the-guild.dev/graphql/ws)
