import { WithId } from 'mongodb';
import { parse } from 'csv-parse/sync';
import { Team, Award } from '@lems/types';
import { getBlock, extractBlocksFromFile } from './csv';

const AWARDS_BLOCK_ID = 1;
const ADVANCEMENT_BLOCK_ID = 2;
const BLOCK_HEADER_LINES = 1;

export const updateAwardsFromFile = (
  teams: Array<WithId<Team>>,
  awards: Array<WithId<Award>>,
  csvData: string
) => {
  const file = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); // Version number: 2nd cell of 1st row.
  if (version !== 1) Promise.reject('LEMS can only parse version 1 award files.');

  const blocks = extractBlocksFromFile(file);
  const awardsBlock = getBlock(blocks, AWARDS_BLOCK_ID).splice(BLOCK_HEADER_LINES);
  const advancementBlock = getBlock(blocks, ADVANCEMENT_BLOCK_ID).splice(BLOCK_HEADER_LINES);

  const newAwards: Array<WithId<Award>> = [];
  const newTeams: Array<WithId<Team>> = teams.map(team => {
    return { ...team, advancing: false };
  });

  awardsBlock.forEach(line => {
    const awardName = line[0];
    const place = parseInt(line[1]);
    const teamNumber = parseInt(line[2]);

    const award = awards.find(a => a.name === awardName && a.place === place);
    if (!award) throw Error(`Invalid award in awards file: ${awardName}-${place}`);
    const team = teams.find(t => t.number === teamNumber);
    if (!team) throw Error(`Invalid team number in awards file: ${teamNumber}`);

    newAwards.push({ ...award, winner: team });
  });

  advancementBlock.forEach(line => {
    const teamNumber = parseInt(line[0]);
    const teamIndex = newTeams.findIndex(t => t.number === teamNumber);
    if (teamIndex === -1) throw Error(`Invalid team number in awards file: ${teamNumber}`);

    newTeams[teamIndex] = { ...newTeams[teamIndex], advancing: true };
  });

  return { teams: newTeams, awards: newAwards };
};
