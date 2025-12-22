export const extractEventBase = (event: Record<string, unknown>) => {
  const eventData = event.data as Record<string, unknown>;
  const deliberationId = (eventData.deliberationId as string) || '';
  const version = (event.version as number) ?? 0;
  return { eventData, deliberationId, version };
};
