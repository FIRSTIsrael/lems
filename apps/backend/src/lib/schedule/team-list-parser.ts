import { WithId } from 'mongodb';
import { parse } from 'csv-parse/sync';
import { Division, Team } from '@lems/types';

export const parseTeamList = (division: WithId<Division>, csvData: string): Array<Team> => {
  const file: string[][] = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); // Version number: 2nd cell of 1st row.
  if (version !== 1) {
    console.error('LEMS can only parse version 1 team lists');
    return [];
  }

  const LINES_TO_SKIP = 1;
  const teamLines = file.splice(LINES_TO_SKIP);

  return teamLines.map(teamLine => ({
    divisionId: division._id,
    number: parseInt(teamLine[0]),
    name: teamLine[1],
    registered: false,
    affiliation: {
      name: teamLine[2],
      city: teamLine[3]
    }
  }));
};
