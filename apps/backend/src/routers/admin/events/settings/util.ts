import { EventSettings as DbEventSettings, UpdateableEventSettings } from '@lems/database';
import { EventSettings } from '@lems/types/api/admin';

export const makeAdminSettingsResponse = (settings: DbEventSettings): EventSettings => {
  return {
    visible: settings.visible,
    completed: settings.completed,
    published: settings.published,
    advancementPercent: settings.advancement_percent,
    eventType: settings.event_type
  };
};

export const makeUpdateableEventSettings = (
  settings: Partial<EventSettings>
): UpdateableEventSettings => {
  const updateData: UpdateableEventSettings = {};

  if (settings.visible !== undefined) {
    updateData.visible = settings.visible;
  }

  if (settings.completed !== undefined) {
    updateData.completed = settings.completed;
  }

  if (settings.published !== undefined) {
    updateData.published = settings.published;
  }

  if (settings.advancementPercent !== undefined) {
    updateData.advancement_percent = settings.advancementPercent;
  }

  if (settings.eventType !== undefined) {
    updateData.event_type = settings.eventType;
  }

  return updateData;
};
