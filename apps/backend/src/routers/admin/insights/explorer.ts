import {
  InsightsExplorerDimension,
  InsightsExplorerQuery,
  InsightsExplorerResult
} from '@lems/types/api/admin';
import { DivisionInsightsData, ScoresheetRecord } from './data';
import { getMissionPoints } from './dashboards';
import { aggregate, groupBy, summarize } from './stats';

interface DimensionValue {
  key: string;
  label: string;
  /** Used to sort rows in a natural order (e.g. team number, round). */
  sort: number | string;
}

interface Fact {
  value: number;
  dimensions: Partial<Record<InsightsExplorerDimension, DimensionValue>>;
}

const ALL: DimensionValue = { key: 'all', label: 'all', sort: 0 };

const teamDimension = (data: DivisionInsightsData, teamId: string): DimensionValue => {
  const team = data.teams.get(teamId)!;
  return { key: teamId, label: `#${team.number} ${team.name}`, sort: team.number };
};

const namedDimension = (
  names: Map<string, string>,
  id: string | null
): DimensionValue | undefined =>
  id && names.has(id) ? { key: id, label: names.get(id)!, sort: names.get(id)! } : undefined;

const stageDimension = (stage: string): DimensionValue => ({
  key: stage,
  label: stage,
  sort: stage === 'PRACTICE' ? 0 : 1
});

const scoresheetFact = (data: DivisionInsightsData, s: ScoresheetRecord, value: number): Fact => ({
  value,
  dimensions: {
    team: teamDimension(data, s.teamId),
    table: namedDimension(data.tables, s.tableId),
    stage: stageDimension(s.stage),
    round: { key: `${s.stage}:${s.round}`, label: `${s.stage}:${s.round}`, sort: s.round }
  }
});

const buildFacts = (data: DivisionInsightsData, query: InsightsExplorerQuery): Fact[] => {
  const scoresheets = query.stage
    ? data.scoresheets.filter(s => s.stage === query.stage)
    : data.scoresheets;

  switch (query.metric) {
    case 'robot-game-score':
      return scoresheets.map(s => scoresheetFact(data, s, s.score));

    case 'mission-points':
      return scoresheets.flatMap(s => {
        const points = getMissionPoints(data, s, query.mission!);
        return points === null ? [] : [scoresheetFact(data, s, points)];
      });

    case 'gp-score':
      return scoresheets.flatMap(s => (s.gp === null ? [] : [scoresheetFact(data, s, s.gp)]));

    case 'rubric-score':
      return data.rubrics
        .filter(r => !query.category || r.category === query.category)
        .flatMap(r => {
          const value = query.field ? r.fields[query.field] : r.average;
          if (value === undefined) return [];
          return [
            {
              value,
              dimensions: {
                team: teamDimension(data, r.teamId),
                room: namedDimension(data.rooms, r.roomId),
                category: { key: r.category, label: r.category, sort: r.category }
              }
            }
          ];
        });

    case 'match-delay':
      return data.matches
        .filter(m => m.delay !== null && (!query.stage || m.stage === query.stage))
        .map(m => ({
          value: m.delay as number,
          dimensions: {
            stage: stageDimension(m.stage),
            round: { key: `${m.stage}:${m.round}`, label: `${m.stage}:${m.round}`, sort: m.round }
          }
        }));

    case 'session-delay':
      return data.sessions
        .filter(s => s.delay !== null)
        .map(s => ({
          value: s.delay as number,
          dimensions: { room: namedDimension(data.rooms, s.roomId) }
        }));
  }
};

export const runExplorerQuery = (
  data: DivisionInsightsData,
  query: InsightsExplorerQuery
): InsightsExplorerResult => {
  const facts = buildFacts(data, query);
  const dimension = query.groupBy;

  const groups = groupBy(
    facts.filter(f => dimension === 'none' || f.dimensions[dimension]),
    f => (dimension === 'none' ? ALL.key : f.dimensions[dimension]!.key)
  );

  const rows = [...groups.values()]
    .map(group => {
      const dim = dimension === 'none' ? ALL : group[0].dimensions[dimension]!;
      const values = group.map(f => f.value);
      return {
        key: dim.key,
        label: dim.label,
        sort: dim.sort,
        stageSort: dimension === 'round' ? (group[0].dimensions.stage?.sort ?? 0) : 0,
        value: aggregate(values, query.aggregation),
        count: values.length
      };
    })
    .sort((a, b) => {
      if (a.stageSort !== b.stageSort) return Number(a.stageSort) - Number(b.stageSort);
      if (typeof a.sort === 'number' && typeof b.sort === 'number') return a.sort - b.sort;
      return String(a.sort).localeCompare(String(b.sort), undefined, { numeric: true });
    })
    .map(({ key, label, value, count }) => ({ key, label, value, count }));

  return { dimension, rows, total: summarize(facts.map(f => f.value)) };
};
