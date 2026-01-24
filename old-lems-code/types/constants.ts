export const TicketTypes = ['general', 'schedule', 'utilities', 'incident'] as const;
export type TicketType = (typeof TicketTypes)[number];

export const RANKING_ANOMALY_THRESHOLD = 3;
export const AnomalyReasonTypes = ['low-rank', 'high-rank'];
export type AnomalyReasons = (typeof AnomalyReasonTypes)[number];
