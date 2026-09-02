# Practice Tables Manager Implementation

## Overview
This document describes the implementation of the Practice Tables Manager role and feature for LEMS (Local Event Management System).

## User Role: Practice Tables Manager (מנהל שולחנות אימונים)

### Purpose
The Practice Tables Manager is responsible for managing practice table assignments during a competition. They can:
- Configure the number of practice tables available
- Set the duration of practice slots
- Define blocked time periods (e.g., lunch breaks)
- Assign teams to specific tables at specific times
- Ensure teams are only assigned once per time slot

## Implementation Details

### 1. Role Definition

**File**: `apps/admin/src/app/[locale]/(dashboard)/events/[slug]/users/types.ts`
- Added `'practice-tables-manager'` to `EDITABLE_MANDATORY_ROLES`

### 2. Localization

**Files**:
- `libs/localization/src/lib/locale/en.json`
- `libs/localization/src/lib/locale/he.json`

Added role translations:
- English: "Practice Tables Manager"
- Hebrew: "מנהל שולחנות אימונים"

**Files**:
- `apps/frontend/locale/en.json`
- `apps/frontend/locale/he.json`

Added page translations for the practice tables manager interface.

### 3. Database Schema

**Migration**: `libs/database/src/migrations/034_create_practice_tables_config_table.ts`

Created two new tables:

#### `practice_tables_config`
- `pk` (serial, primary key)
- `division_id` (uuid, foreign key to divisions.id)
- `table_count` (integer, default: 4)
- `slot_duration_minutes` (integer, default: 15)
- `blocked_time_slots` (jsonb, array of blocked time slots)

#### `practice_tables_schedule`
- `pk` (serial, primary key)
- `id` (uuid, generated)
- `division_id` (uuid, foreign key to divisions.id)
- `team_id` (uuid, foreign key to teams.id)
- `table_number` (integer)
- `start_time` (timestamp)
- `end_time` (timestamp)
- `created_at` (timestamp)

**Schema Types**:
- `libs/database/src/schema/tables/practice-tables-config.ts`
- `libs/database/src/schema/tables/practice-tables-schedule.ts`

### 4. GraphQL API

**Schema**: `libs/types/src/lib/api/lems/graphql/practice-tables.graphql`

#### Types
- `PracticeTablesConfig` - Configuration for a division
- `BlockedTimeSlot` - Represents a blocked time period
- `PracticeTableAssignment` - A team's practice table assignment

#### Queries
- `practiceTablesConfig(divisionId: String!): PracticeTablesConfig`
- `practiceTableAssignments(divisionId: String!): [PracticeTableAssignment!]!`
- `teamPracticeTableAssignments(teamId: String!): [PracticeTableAssignment!]!`

#### Mutations
- `updatePracticeTablesConfig(input: PracticeTablesConfigInput!): PracticeTablesConfig!`
- `createPracticeTableAssignment(input: CreatePracticeTableAssignmentInput!): PracticeTableAssignment!`
- `deletePracticeTableAssignment(assignmentId: String!): Boolean!`
- `clearPracticeTableAssignments(divisionId: String!): Boolean!`

### 5. GraphQL Resolvers

**Query Resolvers**:
- `apps/backend/src/lib/graphql/resolvers/divisions/practice-tables-config.ts`
- `apps/backend/src/lib/graphql/resolvers/divisions/practice-table-assignments.ts`
- `apps/backend/src/lib/graphql/resolvers/divisions/practice-table-assignment-team.ts`

**Mutation Resolvers**:
- `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/update-config.ts`
- `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/create-assignment.ts`
- `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/delete-assignment.ts`
- `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/clear-assignments.ts`

### 6. Frontend Interface

**Files**:
- `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/practice-tables-manager/layout.tsx`
- `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/practice-tables-manager/page.tsx`

The interface includes:
- Configuration panel for table count, slot duration, and blocked times
- Schedule grid for assigning teams to tables
- Validation to prevent double-booking teams

## Usage Instructions

### For Event Administrators

1. **Create Practice Tables Manager User**:
   - Go to Admin App → Events → [Event] → Users
   - Add a new volunteer with role "Practice Tables Manager"
   - Assign to appropriate division(s)

2. **Configure Practice Tables** (to be implemented in admin app):
   - Set number of tables available
   - Define slot duration
   - Add blocked time periods

### For Practice Tables Managers

1. **Login**:
   - Navigate to the event login page
   - Select "Practice Tables Manager" role
   - Enter credentials

2. **Manage Schedule**:
   - View the schedule grid (time slots × tables)
   - Click cells to assign teams
   - Teams can only be assigned once per time slot
   - Clear assignments as needed

## Next Steps

### To Complete Implementation:

1. **Run Database Migration**:
   ```bash
   npm run migrate
   ```

2. **Add Configuration UI in Admin App**:
   - Create interface in admin app for event organizers to configure practice tables settings
   - Add to event setup workflow

3. **Enhance Frontend Interface**:
   - Implement interactive schedule grid
   - Add team selection dropdown
   - Add real-time updates via GraphQL subscriptions
   - Add conflict detection and warnings

4. **Testing**:
   - Test role authorization
   - Test GraphQL queries and mutations
   - Test schedule conflict prevention
   - Test with multiple divisions

## Technical Notes

- The system prevents double-booking by checking for overlapping time slots when creating assignments
- Blocked time slots are stored as JSON in the database for flexibility
- Each division can have its own practice tables configuration
- The configuration is optional - divisions without configuration won't show practice tables

## Files Modified/Created

### Database
- ✅ `libs/database/src/migrations/034_create_practice_tables_config_table.ts`
- ✅ `libs/database/src/schema/tables/practice-tables-config.ts`
- ✅ `libs/database/src/schema/tables/practice-tables-schedule.ts`
- ✅ `libs/database/src/schema/index.ts`
- ✅ `libs/database/src/schema/kysely.ts`

### GraphQL
- ✅ `libs/types/src/lib/api/lems/graphql/practice-tables.graphql`
- ✅ `apps/backend/src/lib/graphql/resolvers/divisions/practice-tables-config.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/divisions/practice-table-assignments.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/divisions/practice-table-assignment-team.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/update-config.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/create-assignment.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/delete-assignment.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/clear-assignments.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/practice-tables/index.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/mutations/index.ts`
- ✅ `apps/backend/src/lib/graphql/resolvers/index.ts`

### Frontend
- ✅ `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/practice-tables-manager/layout.tsx`
- ✅ `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/practice-tables-manager/page.tsx`
- ✅ `apps/frontend/locale/en.json`
- ✅ `apps/frontend/locale/he.json`

### Admin
- ✅ `apps/admin/src/app/[locale]/(dashboard)/events/[slug]/users/types.ts`

### Localization
- ✅ `libs/localization/src/lib/locale/en.json`
- ✅ `libs/localization/src/lib/locale/he.json`
