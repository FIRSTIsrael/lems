import { Team } from '@lems/types';

export const localizeTeam = (team: Team, prefix = true) => {
  console.log(team);
  return `${prefix ? 'קבוצה' : ''} #${team.number}, ${team.name} מ${team.affiliation.name}, ${
    team.affiliation.city
  }`;
};
