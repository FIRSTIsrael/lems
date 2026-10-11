/**
 * Generates time slots for practice tables based on start time, end time, and slot duration
 * @param startTime - Start time in ISO 8601 datetime format
 * @param endTime - End time in ISO 8601 datetime format
 * @param slotDurationMinutes - Duration of each slot in minutes
 * @returns Array of ISO 8601 datetime strings representing each time slot
 */
export function generatePracticeTableTimeSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number
): string[] {
  const slots: string[] = [];
  const start = new Date(startTime);
  const end = new Date(endTime);

  let current = new Date(start);
  while (current < end) {
    slots.push(current.toISOString());
    current = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
  }

  return slots;
}

/**
 * Checks if a given time slot is within a blocked time range
 * @param slotTime - The time slot to check (ISO 8601 datetime)
 * @param blockedStart - Start of blocked period (ISO 8601 datetime)
 * @param blockedEnd - End of blocked period (ISO 8601 datetime)
 * @returns True if the slot is blocked
 */
export function isTimeSlotBlocked(
  slotTime: string,
  blockedStart: string,
  blockedEnd: string
): boolean {
  const slot = new Date(slotTime);
  const start = new Date(blockedStart);
  const end = new Date(blockedEnd);
  return slot >= start && slot < end;
}

/**
 * Calculates how many time slots a blocked period spans
 * @param blockedStart - Start of blocked period (ISO 8601 datetime)
 * @param blockedEnd - End of blocked period (ISO 8601 datetime)
 * @param allSlots - Array of all time slots
 * @returns Number of slots the blocked period spans
 */
export function calculateBlockedSlotSpan(
  blockedStart: string,
  blockedEnd: string,
  allSlots: string[]
): number {
  return allSlots.filter(slot => isTimeSlotBlocked(slot, blockedStart, blockedEnd)).length;
}

/**
 * Formats a datetime to display time only (HH:MM format)
 * @param datetime - ISO 8601 datetime string
 * @returns Time in HH:MM format
 */
export function formatTimeOnly(datetime: string): string {
  const date = new Date(datetime);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
