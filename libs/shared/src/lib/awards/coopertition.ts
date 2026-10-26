import { groupTablesByPair, type PairableTable } from '../utils/table-pairs';

export interface CoopertitionMatchInput {
  matchNumber: number;
  stage: string;
  round: number;
  participants: { teamId: string | null; tableId: string }[];
}

export interface CoopertitionScoresheetInput {
  teamId: string;
  stage: string;
  round: number;
  status: string;
  score: number;
}

export interface CoopertitionResult {
  matchNumber: number;
  teamIds: [string, string];
  scores: [number, number];
}

/** Builds one result per ranking match pair where both sides have a submitted scoresheet. */
export const buildCoopertitionResults = (
  matches: CoopertitionMatchInput[],
  tables: PairableTable[],
  scoresheets: CoopertitionScoresheetInput[]
): CoopertitionResult[] => {
  const pairs = groupTablesByPair(tables).filter(group => group.tables.length === 2);
  const results: CoopertitionResult[] = [];

  for (const match of matches) {
    if (match.stage !== 'RANKING') continue;

    for (const pair of pairs) {
      const [teamA, teamB] = pair.tables.map(
        table => match.participants.find(p => p.tableId === table.id)?.teamId ?? null
      );
      if (!teamA || !teamB) continue;

      const [sheetA, sheetB] = [teamA, teamB].map(teamId =>
        scoresheets.find(
          s =>
            s.teamId === teamId &&
            s.stage === match.stage &&
            s.round === match.round &&
            s.status === 'submitted'
        )
      );
      if (!sheetA || !sheetB) continue;

      results.push({
        matchNumber: match.matchNumber,
        teamIds: [teamA, teamB],
        scores: [sheetA.score, sheetB.score]
      });
    }
  }

  return results;
};

/** Mean score per team over submitted ranking scoresheets. */
export const computeTeamAverages = (
  scoresheets: CoopertitionScoresheetInput[]
): Record<string, number> => {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const sheet of scoresheets) {
    if (sheet.stage !== 'RANKING' || sheet.status !== 'submitted') continue;
    const entry = (totals[sheet.teamId] ??= { sum: 0, count: 0 });
    entry.sum += sheet.score;
    entry.count++;
  }

  return Object.fromEntries(
    Object.entries(totals).map(([teamId, { sum, count }]) => [teamId, sum / count])
  );
};

/** Picks the top `places` results; a team may appear in more than one winning pair. */
export const selectCoopertitionWinners = (
  results: CoopertitionResult[],
  averages: Record<string, number>,
  places: number
): [string, string][] => {
  const averageSum = (result: CoopertitionResult) =>
    (averages[result.teamIds[0]] ?? 0) + (averages[result.teamIds[1]] ?? 0);

  return [...results]
    .sort(
      (a, b) =>
        b.scores[0] + b.scores[1] - (a.scores[0] + a.scores[1]) ||
        averageSum(b) - averageSum(a) ||
        a.matchNumber - b.matchNumber
    )
    .slice(0, places)
    .map(result => [...result.teamIds]);
};
