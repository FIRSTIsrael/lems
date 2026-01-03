import { Award as DbAward } from '@lems/database';
import { Award } from '@lems/types/api/admin';

/**
 * Transforms an award object into a response format.
 * @param award - The award object to transform.
 */
export const makeAdminAwardResponse = (award: DbAward, includeWinner = false): Award => {
  const winner = award.type === 'PERSONAL' ? award.winner_name : award.winner_id;

  return {
    id: award.id,
    divisionId: award.division_id,
    name: award.name,
    type: award.type,
    isOptional: award.is_optional,
    showPlaces: award.show_places,
    allowNominations: award.allow_nominations,
    automaticAssignment: award.automatic_assignment,
    place: award.place,
    index: award.index,
    ...(includeWinner && { winner })
  };
};
