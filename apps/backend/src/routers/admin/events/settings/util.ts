import { EventSettings as DbEventSettings, UpdateableEventSettings } from '@lems/database';
import { EventSettings } from '@lems/types/api/admin';

export const makeAdminSettingsResponse = (settings: DbEventSettings): EventSettings => {
  return {
    visible: settings.visible,
    official: settings.official,
    completed: settings.completed,
    published: settings.published,
    advancementPercent: settings.advancement_percent,
    openRubricsDuringSession: settings.open_rubrics_during_session
  };
};

const assignIfDefined = <K extends string, V>(
  obj: Record<K, V>,
  key: K,
  value: V | undefined
): void => {
  if (value !== undefined) {
    obj[key] = value;
  }
};

export const makeUpdateableEventSettings = (
  settings: Partial<EventSettings>
): UpdateableEventSettings => {
  const result: Record<string, unknown> = {};

  assignIfDefined(result, 'visible', settings.visible);
  assignIfDefined(result, 'official', settings.official);
  assignIfDefined(result, 'completed', settings.completed);
  assignIfDefined(result, 'published', settings.published);
  assignIfDefined(result, 'advancement_percent', settings.advancementPercent);
  assignIfDefined(result, 'open_rubrics_during_session', settings.openRubricsDuringSession);

  return result as UpdateableEventSettings;
};
