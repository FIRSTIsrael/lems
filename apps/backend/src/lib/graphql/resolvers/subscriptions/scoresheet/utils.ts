export const extractEventBase = (event: Record<string, unknown>) => {
  const eventData = event.data as Record<string, unknown>;
  const scoresheetId = (eventData.scoresheetId as string) || '';
  const version = (event.version as number) ?? 0;
  return { eventData, scoresheetId, version };
};
