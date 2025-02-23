import { FllEvent } from "../../../libs/types/src";

export const mockEvent : FllEvent = {
  name: "התחרות הכי שווה בעיר",
  startDate: new Date(2025, 1, 2),
  endDate: new Date(2025, 1, 2),
  location: "הכפר הירוק",
  eventUsers: ["tournament-manager", "pit-admin", "field-manager"]
}