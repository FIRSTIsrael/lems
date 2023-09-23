import { Team } from '@lems/types';

export const localizeTeam = (team: Team) =>
  `קבוצה #${team.number}, ${team.name} מ${team.affiliation.institution}, ${team.affiliation.city}`;
