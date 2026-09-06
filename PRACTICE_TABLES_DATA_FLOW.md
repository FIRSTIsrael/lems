# Practice Tables Data Flow

## Complete Data Flow

### 1. Admin Configuration
**Location:** `apps/admin/.../practice-tables/`

1. Admin selects division
2. Admin configures:
   - Number of tables
   - Slot duration
   - Start/end times
   - Blocked time periods
3. Saves via GraphQL mutation `updatePracticeTablesConfig`
4. Data stored in `practice_tables_config` table

### 2. Frontend Assignment
**Location:** `apps/frontend/.../practice-tables-manager/`

1. Volunteer selects division (from event context)
2. Loads configuration via GraphQL query `practiceTablesConfig`
3. Loads existing assignments via GraphQL query `practiceTableAssignments`
4. Displays schedule grid with:
   - Time slots (based on config)
   - Practice tables (based on config)
   - Existing assignments
   - Blocked periods
5. Volunteer assigns team:
   - Selects a grid cell (table + time)
   - Searches for team
   - Clicks "Assign"
   - Creates assignment via GraphQL mutation `createPracticeTableAssignment`
   - Data stored in `practice_table_assignments` table
6. Volunteer can clear assignment:
   - Clicks X on assignment chip
   - Deletes via GraphQL mutation `deletePracticeTableAssignment`

### 3. Portal Display
**Location:** `apps/portal/.../practice-tables-tab.tsx`

1. Team views event page
2. Clicks "Practice Tables" tab
3. Portal loads:
   - Configuration via REST API `/portal/divisions/:id/practice-tables-config`
   - Assignments via REST API `/portal/divisions/:id/practice-table-assignments`
4. Displays read-only schedule showing:
   - All time slots
   - All practice tables
   - Team assignments (shows team number)
   - Blocked periods
   - Available slots

## Database Schema

### `practice_tables_config`
```sql
- pk (serial)
- division_id (uuid, FK to divisions)
- table_count (integer)
- slot_duration_minutes (integer)
- start_time (varchar, HH:MM format)
- end_time (varchar, HH:MM format)
- blocked_time_slots (jsonb array)
```

### `practice_table_assignments`
```sql
- id (uuid, PK)
- division_id (uuid, FK to divisions)
- team_id (uuid, FK to teams)
- table_number (integer, 1-based)
- start_time (varchar, HH:MM format)
- end_time (varchar, HH:MM format)
- created_at (timestamp)
```

## API Endpoints

### GraphQL (Admin & Frontend)
- **Query:** `practiceTablesConfig(divisionId: String!)`
- **Query:** `practiceTableAssignments(divisionId: String!)`
- **Mutation:** `updatePracticeTablesConfig(input: PracticeTablesConfigInput!)`
- **Mutation:** `deletePracticeTablesConfig(divisionId: String!)`
- **Mutation:** `createPracticeTableAssignment(input: CreatePracticeTableAssignmentInput!)`
- **Mutation:** `deletePracticeTableAssignment(assignmentId: String!)`

### REST (Portal)
- **GET** `/portal/divisions/:divisionId/practice-tables-config`
- **GET** `/portal/divisions/:divisionId/practice-table-assignments`

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        ADMIN                            │
│  Configure tables, times, blocked periods              │
│                          ↓                              │
│              updatePracticeTablesConfig                 │
│                          ↓                              │
│              practice_tables_config table               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  Load config → Display grid → Assign teams             │
│                          ↓                              │
│          createPracticeTableAssignment                  │
│                          ↓                              │
│           practice_table_assignments table              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                       PORTAL                            │
│  Load config + assignments → Display schedule          │
│                          ↓                              │
│              Read-only view for teams                   │
└─────────────────────────────────────────────────────────┘
```

## Real-Time Updates

- Frontend uses Apollo Client with GraphQL queries
- Portal uses REST API with `useRealtimeData` hook
- Both automatically update when data changes
- Assignments are immediately visible in portal after creation

## Validation Rules

1. **Configuration:**
   - Table count > 0
   - Slot duration > 0
   - Start time < End time
   - Blocked periods within start/end range

2. **Assignments:**
   - Team must exist in division
   - Table number must be ≤ table count
   - Time must be within configured range
   - Time must not be blocked
   - (Future) One team per time slot across all tables

## Future Enhancements

- [ ] Prevent duplicate team assignments in same time slot
- [ ] Bulk assignment tools
- [ ] Assignment history/audit log
- [ ] Email notifications to teams
- [ ] Export schedule to PDF/CSV
- [ ] Conflict detection and warnings
