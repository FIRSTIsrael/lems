import { ScoresheetError } from './scoresheet-types';

export const findMission = (
  missions: Array<{ id: string; values: Array<string | number | boolean> }>,
  missionId: string
): { id: string; values: Array<string | number | boolean> } => {
  const m = missions.find(mission => mission.id === missionId);
  if (m) return m;
  throw new ScoresheetError('e-00');
};
