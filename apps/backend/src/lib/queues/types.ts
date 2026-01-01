export type ScheduledEventType =
  | 'session-completed'
  | 'match-completed'
  | 'match-endgame-triggered';

export interface ScheduledEvent {
  eventType: ScheduledEventType;
  divisionId: string;
  metadata: Record<string, unknown>;
}
