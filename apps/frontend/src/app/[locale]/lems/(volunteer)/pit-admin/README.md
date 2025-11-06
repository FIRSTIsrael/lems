# Pit Admin Real-Time Team Arrival Tracking

This implementation provides real-time team arrival tracking for the Pit Admin page using GraphQL subscriptions.

## Files Created

### 1. `graphql.ts`
Defines TypedDocumentNode GraphQL operations:
- **GET_DIVISION_TEAMS**: Query to fetch all teams in a division with their arrival status
- **TEAM_ARRIVED_MUTATION**: Mutation to mark a team as arrived
- **TEAM_ARRIVAL_UPDATED_SUBSCRIPTION**: Subscription to receive real-time team arrival updates

### 2. `use-pit-admin-teams.ts`
Custom React hook that manages team data and real-time updates:

**Features:**
- Fetches initial team list using `useQuery` with cache-and-network policy
- Subscribes to team arrival events using `useSubscription`
- Implements optimistic UI updates for instant feedback
- Gracefully handles errors and reverts optimistic updates on failure
- Tracks WebSocket connection status
- Automatic reconnection recovery (handled by graphql-ws client)
- Prevents infinite React render loops using refs and careful state management

**API:**
```typescript
const { teams, loading, error, connected, markTeamArrived } = usePitAdminTeams(divisionId);
```

### 3. `page.tsx`
The Pit Admin page component featuring:
- Connection status indicator (Connected/Disconnected chip)
- Loading states with spinner
- Error display with Alert component
- Autocomplete search for selecting teams (filters out already-arrived teams)
- Button to mark selected team as arrived with optimistic updates
- Comprehensive team list showing:
  - Arrival status with icons and color coding
  - Team number, name, affiliation, and city
  - Visual differentiation between arrived and pending teams
- Summary statistics (total teams, arrived count, pending count)

## Key Implementation Details

### Real-Time Updates
- Uses `graphql-ws` protocol for WebSocket subscriptions
- Subscription automatically reconnects on network failures
- Updates are received and applied without page refresh

### Optimistic UI
When marking a team as arrived:
1. UI updates immediately (optimistic)
2. Mutation sent to server
3. On success: actual data arrives via subscription
4. On error: UI reverts to previous state

### State Management
- Uses `useRef` to store team data map for O(1) lookups
- State updates trigger re-renders only when necessary
- Avoids race conditions between query, subscription, and mutation updates

### Performance
- Efficient team lookups using Map data structure
- Filtered autocomplete options (only unarrived teams)
- Minimal re-renders through careful state management

## Usage

The page is automatically mounted at `/lems/pit-admin` route and requires pit-admin role authorization (handled in layout.tsx).

No additional setup needed - the Apollo Client and WebSocket link are already configured globally.

## Testing Checklist

- [ ] Initial page load shows all teams
- [ ] Connection status displays correctly
- [ ] Autocomplete filters unarrived teams
- [ ] Marking team as arrived updates UI immediately
- [ ] Real-time updates arrive when other users mark teams
- [ ] Error states display appropriately
- [ ] Disconnection/reconnection handled gracefully
- [ ] Optimistic updates revert on mutation failure
