export interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
}

export interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

export interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: BlockedTimeSlot[];
}

export interface PracticeTableAssignment {
  id: string;
  divisionId: string;
  team: Team;
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

// Query types
export interface PracticeTablesConfigData {
  division: {
    id: string;
    practiceTables: {
      divisionId: string;
      config: PracticeTablesConfig | null;
    };
  } | null;
}

export interface PracticeTablesConfigVars {
  divisionId: string;
}

export interface PracticeTableAssignmentsData {
  division: {
    id: string;
    practiceTables: {
      divisionId: string;
      schedule: PracticeTableAssignment[];
    };
  } | null;
}

export interface PracticeTableAssignmentsVars {
  divisionId: string;
}

// Mutation types
export interface UpdateAssignmentData {
  updatePracticeTableAssignment: PracticeTableAssignment;
}

export interface UpdateAssignmentVars {
  input: {
    divisionId: string;
    teamId: string | null;
    tableIndex: number;
    startTime: string;
  };
}

// Subscription types
export interface AssignmentsSubscriptionData {
  practiceTableAssignmentsUpdated: PracticeTableAssignment[];
}

export interface SubscriptionVars {
  divisionId: string;
}
