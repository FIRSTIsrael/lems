export const extractEventBase = (event: Record<string, unknown>) => {
  const eventData = event.data as Record<string, unknown>;
  const rubricId = (eventData.rubricId as string) || '';
  return { eventData, rubricId };
};
