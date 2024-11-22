export interface LocalizedMissionClause {
  description: string;
  labels?: Array<string>;
}

export interface LocalizedMission {
  id: string;
  title: string;
  description?: string;
  clauses: Array<LocalizedMissionClause>;
  remarks?: Array<string>;
  errors?: Array<{ id: string; description: string }>;
}

export interface LocalizedScoresheet {
  missions: Array<LocalizedMission>;
  errors: Array<{ id: string; description: string }>;
}
