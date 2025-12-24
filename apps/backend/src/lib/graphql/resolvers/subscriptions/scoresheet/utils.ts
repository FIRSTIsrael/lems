export const extractEventBase = (event: Record<string, unknown>) => {
  const eventData = event.data as Record<string, unknown>;
  const scoresheetId = (eventData.scoresheetId as string) || '';
  return { eventData, scoresheetId };
};
