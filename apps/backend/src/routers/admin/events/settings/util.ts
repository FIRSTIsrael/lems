import { EventSettings as DbEventSettings, UpdateableEventSettings } from "@lems/database";
import { EventSettings } from '@lems/types/api/admin';


export const makeAdminSettingsResponse = (settings: DbEventSettings): EventSettings => {
  return {
    completed: settings.completed,
    published: settings.published,
    advancementPercent: settings.advancement_percent,
  };
};

export const makeUpdateableEventSettings = (settings: Partial<EventSettings>): UpdateableEventSettings => {
  const updateData: UpdateableEventSettings = {};
  
  if (settings.completed !== undefined) {
    updateData.completed = settings.completed;
  }
  
  if (settings.published !== undefined) {
    updateData.published = settings.published;
  }
  
  if (settings.advancementPercent !== undefined) {
    updateData.advancement_percent = settings.advancementPercent;
  }
  
  return updateData;
};