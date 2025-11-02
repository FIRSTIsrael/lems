# Redis Integration - Base Implementation

This document describes the minimal Redis implementation for LEMS.

## Overview

The Redis implementation provides:
- **Connection Management**: Singleton pattern for reliable Redis client management
- **Pub/Sub Foundation**: Redis Streams-based architecture for multi-instance support
- **Graceful Shutdown**: Proper cleanup during application shutdown

## Files Structure

```
apps/backend/src/lib/redis/
├── redis-client.ts           # Connection management
├── redis-streams-pubsub.ts   # Pub/Sub implementation
├── initialization.ts         # Startup/shutdown handlers
└── index.ts                  # Public API exports
```

## Configuration

Set these environment variables (see `.env.redis.example`):

```env
REDIS_HOST=localhost           # Redis server hostname
REDIS_PORT=6379               # Redis server port
REDIS_PASSWORD=               # Redis password (optional)
REDIS_DB=0                    # Database number (0-15)
REDIS_CONSUMER_GROUP=lems-graphql  # Consumer group name
INSTANCE_ID=instance-1        # Unique instance identifier
```

## Usage

### Basic Redis Operations

```typescript
import { getRedisClient } from './lib/redis';

const redis = getRedisClient();

// Set a value
await redis.set('key', 'value');

// Get a value
const value = await redis.get('key');

// Delete a key
await redis.del('key');
```

### Pub/Sub with Streams

```typescript
import { getRedisStreamsPubSub } from './lib/redis';

const pubsub = getRedisStreamsPubSub();

// Publish a message to a stream
const messageId = await pubsub.publish('matchUpdates', {
  matchId: '123',
  score: 100,
});

// Initialize consumer group (required before consuming)
await pubsub.initializeConsumerGroup('matchUpdates');
```

## Integration Points

1. **main.ts** - Redis is initialized on startup and cleaned up on graceful shutdown
2. **Error Handling** - Redis initialization failures are logged but don't block server startup
3. **Connection Events** - Logged with clear status indicators (✅, ❌, ⚠️)

## Next Steps

When ready to extend this implementation:
1. Add subscription consumers for specific streams
2. Integrate with GraphQL resolvers for pub/sub subscriptions
3. Implement message consumers with acknowledgment
4. Add monitoring and metrics collection

## Connection Status

The implementation logs connection events:
- ✅ Connected - Redis client successfully connected
- ❌ Error - Connection or operation error
- ⚠️ Closed - Connection was closed or consumer group already exists

Check logs during startup to verify Redis connectivity.
