export interface AgendaEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
}

export interface QueryData {
  division?: {
    id: string;
    agenda: AgendaEvent[];
  } | null;
}

export interface QueryVars {
  divisionId: string;
  visibility?: string[];
}
