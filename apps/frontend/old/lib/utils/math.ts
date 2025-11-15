import { PRELIMINARY_DELIBERATION_PICKLIST_LENGTH } from '@lems/types';

export const getDefaultPicklistLimit = (teamsLength: number) =>
  Math.min(PRELIMINARY_DELIBERATION_PICKLIST_LENGTH, Math.ceil(teamsLength * 0.35));
