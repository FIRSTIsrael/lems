# Redis Pub/Sub with Recovery Buffer - Usage Example

## Architecture Overview

This implementation uses:
- **Redis Pub/Sub** for real-time event broadcast (instant delivery to all clients)
- **Redis Sorted Sets** as buffers per event type per division (30-second window for recovery)
- **Version tracking** per event type for gap detection

```
Division 1 Stream:
├─ TEAM_ARRIVED (sorted set: buffer:division-1:TEAM_ARRIVED)
├─ TEAM_LEFT (sorted set: buffer:division-1:TEAM_LEFT)
├─ MATCH_STARTED (sorted set: buffer:division-1:MATCH_STARTED)
└─ ... (other event types)

Pub/Sub Channels:
├─ division:division-1:events (broadcast channel)
├─ division:division-2:events
└─ ...
```

## Usage

### 1. Publishing Events

```typescript
import { getRedisStreamsPubSub, RedisEventTypes } from '@lems/backend/redis';

const pubsub = getRedisStreamsPubSub();

// Publish an event
await pubsub.publish('division-123', RedisEventTypes.TEAM_ARRIVED, {
  teamId: 'team-456',
  teamName: 'Robotics Team A',
  arrivalTime: Date.now()
});

// The event is:
// 1. Broadcast via Pub/Sub to all connected clients
// 2. Stored in Redis buffer: buffer:division-123:TEAM_ARRIVED
```

### 2. Subscribing (New Client - No Recovery Needed)

```typescript
// Client connects for the first time
const eventTypes = [
  RedisEventTypes.TEAM_ARRIVED,
  RedisEventTypes.TEAM_LEFT,
  RedisEventTypes.MATCH_STARTED
];

const pubsub = getRedisStreamsPubSub();

// Subscribe to real-time events
for await (const event of pubsub.asyncIterator('division-123', eventTypes)) {
  if (event.data._gap) {
    // Gap detected: events were discarded before client could recover
    console.log('Gap detected, performing full refetch:', event.data);
    await refetchDivisionState();
    break;
  }
  
  // Handle normal event
  handleEvent(event);
}
```

### 3. Subscribing with Recovery (Client Reconnect < 30s)

```typescript
// Client had a momentary disconnect (< 30 seconds)
// Client already has these versions from previous connection:
const clientLastVersions = new Map([
  [RedisEventTypes.TEAM_ARRIVED, 5],
  [RedisEventTypes.TEAM_LEFT, 3],
  [RedisEventTypes.MATCH_STARTED, 2]
]);

const pubsub = getRedisStreamsPubSub();

// Subscribe with recovery
for await (const event of pubsub.asyncIterator(
  'division-123',
  eventTypes,
  clientLastVersions // Pass last known versions
)) {
  if (event.data._gap) {
    // Gap detected
    console.log('Gap detected, performing full refetch');
    await refetchDivisionState();
    break;
  }
  
  // First, you'll get recovered events (v6, v4, etc.)
  // Then, new real-time events as they arrive
  handleEvent(event);
}
```

### 4. Getting Current Version (For Tracking on Client)

```typescript
// Client can get the current server version for tracking
const currentTeamArrivedVersion = pubsub.getEventTypeVersion(
  RedisEventTypes.TEAM_ARRIVED
);

console.log('Server is at version:', currentTeamArrivedVersion);
// Store this on client for later recovery
localStorage.setItem('lastTeamArrivedVersion', currentTeamArrivedVersion);
```

## Flow Diagrams

### New Client Connection
```
1. Client connects
   ↓
2. No recovery needed (asyncIterator without clientLastVersions)
   ↓
3. Subscribe to Pub/Sub channel
   ↓
4. Receive real-time events as they arrive
```

### Client Reconnection (< 30s)
```
1. Client reconnects with lastVersions: { TEAM_ARRIVED: 5 }
   ↓
2. asyncIterator retrieves buffer:division-1:TEAM_ARRIVED
   ↓
3. Filters events where version > 5 from the buffer
   ↓
4. Yields recovered events (v6, v7, etc.)
   ↓
5. Subscribes to Pub/Sub
   ↓
6. Receives new real-time events
```

### Client Reconnection (> 30s)
```
1. Client reconnects with lastVersions: { TEAM_ARRIVED: 2 }
2. Server currentVersion = 150
   ↓
3. Gap = 150 - 2 = 148 > maxBufferSize (1000)
   ↓
4. Yields _gap event
   ↓
5. Client receives _gap and triggers full refetch
   ↓
6. Client re-queries initial state
```

## Redis Data Structure

### Sorted Set Buffer (Per Event Type)
```
KEY: buffer:division-1:TEAM_ARRIVED
VALUE: Sorted Set of JSON-serialized events
SCORE: Timestamp (used for automatic cleanup)

Example:
  score=1699099200000  value='{"type":"TEAM_ARRIVED","divisionId":"division-1","version":5,"timestamp":1699099200000,...}'
  score=1699099201000  value='{"type":"TEAM_ARRIVED","divisionId":"division-1","version":6,"timestamp":1699099201000,...}'
  score=1699099202000  value='{"type":"TEAM_ARRIVED","divisionId":"division-1","version":7,"timestamp":1699099202000,...}'

EXPIRATION: 35 seconds (30s buffer + 5s grace period)
```

### Pub/Sub Channel
```
CHANNEL: division:division-1:events
SUBSCRIBERS: All clients connected to that division
MESSAGE: JSON-serialized event

Example message:
{
  "type": "TEAM_ARRIVED",
  "divisionId": "division-1",
  "timestamp": 1699099200000,
  "instanceId": "instance-12345",
  "version": 5,
  "data": {
    "teamId": "team-456",
    "teamName": "Robotics Team A"
  }
}
```

## Recovery Guarantees

| Scenario | Recovery | Action |
|----------|----------|--------|
| New client | N/A | Subscribe to real-time events |
| Disconnect < 30s | Replay from buffer | Recover missed events by version |
| Disconnect > 30s | Gap detected | Full state refetch |
| Gap > 1000 events | Gap detected | Full state refetch |

## Configuration

```typescript
// In RedisStreamsPubSub constructor
private messageRetentionMs: number = 30 * 1000;  // 30 seconds
private maxBufferSize: number = 1000;              // Max events per type
```

Adjust these based on your needs:
- Longer retention = more memory but better recovery window
- Larger maxBufferSize = more memory but fewer full refetches

## Performance Considerations

- **Memory**: ~150 bytes per event × 1000 events × 12 event types per division ≈ 1.8 MB per division
- **Redis Operations per publish**: 3-4 commands (ZADD, ZREMRANGEBYSCORE, EXPIRE)
- **Redis Pub/Sub**: O(N) where N = number of subscribers

## Error Handling

```typescript
// Gap detection
if (event.data._gap) {
  console.log('Too many missed events, doing full refetch');
  // Trigger full state refetch from DB
}

// Parsing errors are caught and logged, subscription continues
// Connection drops are handled by the client (reconnect logic)
```
