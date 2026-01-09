import { Award as ApiAward } from '@lems/types/api/admin';
import {
  AwardSchema,
  Award,
  CORE_VALUES_AWARDS,
  OPTIONAL_AWARDS,
  PERSONAL_AWARDS,
  AUTOMATIC_ASSIGNMENT_AWARDS,
  HIDE_PLACES
} from '../types';

/**
 * Converts an array of API award responses to an AwardSchema object
 * used by the admin awards editor.
 */
export function parseApiResponseToSchema(awards: ApiAward[]): AwardSchema | null {
  const schema: AwardSchema = {};

  if (awards.length === 0) {
    return null;
  }

  awards.forEach(award => {
    const awardKey = award.name as Award;

    schema[awardKey] = {
      count: 1, // Each award in the response represents one instance
      index: award.index
    };
  });

  // Group awards by name and count occurrences (for awards with multiple places)
  const groupedAwards: { [key: string]: { indices: number[]; count: number } } = {};

  awards.forEach(award => {
    const awardKey = award.name as Award;
    if (!groupedAwards[awardKey]) {
      groupedAwards[awardKey] = { indices: [], count: 0 };
    }
    groupedAwards[awardKey].indices.push(award.index);
    groupedAwards[awardKey].count++;
  });

  // Rebuild schema with proper counts and minimum index
  const finalSchema: AwardSchema = {};
  Object.entries(groupedAwards).forEach(([awardKey, data]) => {
    finalSchema[awardKey] = {
      count: data.count,
      index: Math.min(...data.indices) // Use the lowest index for ordering
    };
  });

  return finalSchema;
}

/**
 * Converts an AwardSchema to an array of award data that can be sent to the API
 * for creating/updating the awards configuration.
 */
export function parseSchemaToApiRequest(
  schema: AwardSchema | null
): Array<Omit<ApiAward, 'id' | 'divisionId'>> {
  if (!schema) return [];

  const awards: Array<Omit<ApiAward, 'id' | 'divisionId'>> = [];

  // Get awards that have count > 0, sorted by index
  const activeAwards = Object.entries(schema)
    .filter(([, item]) => item.count > 0)
    .sort(([, a], [, b]) => a.index - b.index);

  let globalIndex = 0;

  activeAwards.forEach(([awardName, schemaItem]) => {
    const award = awardName as Award;

    const isPersonal = (PERSONAL_AWARDS as readonly string[]).includes(award);
    const isOptional = !(OPTIONAL_AWARDS as readonly string[]).includes(award);
    const allowNominations = (CORE_VALUES_AWARDS as readonly string[]).includes(award);
    const automaticAssignment = (AUTOMATIC_ASSIGNMENT_AWARDS as readonly string[]).includes(award);
    const showPlaces = !(HIDE_PLACES as readonly string[]).includes(award);

    for (let place = 1; place <= schemaItem.count; place++) {
      awards.push({
        name: award,
        index: globalIndex++,
        place: place,
        type: isPersonal ? 'PERSONAL' : 'TEAM',
        isOptional,
        showPlaces,
        allowNominations,
        automaticAssignment
      });
    }
  });

  return awards;
}
