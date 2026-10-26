export type TableSide = 'A' | 'B';

export const TABLE_SIDES: readonly TableSide[] = ['A', 'B'];

export const PAIR_NAME_SEPARATOR = ' – ';

export interface PairableTable {
  id: string;
  name: string;
  pairKey?: string | null;
  side?: string | null;
}

export const makeSideTableName = (base: string, side: TableSide): string =>
  `${base}${PAIR_NAME_SEPARATOR}${side}`;

export const getPhysicalTableName = (table: PairableTable): string => {
  if (!table.side) return table.name;
  const suffix = `${PAIR_NAME_SEPARATOR}${table.side}`;
  return table.name.endsWith(suffix) ? table.name.slice(0, -suffix.length) : table.name;
};

export interface TableGroup<T extends PairableTable> {
  key: string;
  name: string;
  tables: T[];
}

export const groupTablesByPair = <T extends PairableTable>(tables: T[]): TableGroup<T>[] => {
  const groups = new Map<string, T[]>();
  for (const table of tables) {
    const key = table.pairKey ?? table.id;
    const group = groups.get(key);
    if (group) group.push(table);
    else groups.set(key, [table]);
  }

  return Array.from(groups, ([key, groupTables]) => {
    const sorted = [...groupTables].sort(
      (a, b) =>
        TABLE_SIDES.indexOf((a.side ?? 'A') as TableSide) -
        TABLE_SIDES.indexOf((b.side ?? 'A') as TableSide)
    );
    return { key, name: getPhysicalTableName(sorted[0]), tables: sorted };
  });
};

export interface ParticipantPairGroup<P> {
  key: string;
  name: string;
  sides: { table: PairableTable; participant: P | null }[];
}

export const groupParticipantsByPair = <P extends { table: { id: string } }>(
  participants: P[],
  tables: PairableTable[]
): ParticipantPairGroup<P>[] =>
  groupTablesByPair(tables).map(group => ({
    key: group.key,
    name: group.name,
    sides: group.tables.map(table => ({
      table,
      participant: participants.find(p => p.table.id === table.id) ?? null
    }))
  }));

export const getOpponent = <P extends { table: { id: string } }>(
  participants: P[],
  tableId: string,
  tables: PairableTable[]
): P | null => {
  const group = groupTablesByPair(tables).find(g => g.tables.some(t => t.id === tableId));
  if (!group || group.tables.length < 2) return null;
  const other = group.tables.find(t => t.id !== tableId);
  return participants.find(p => p.table.id === other?.id) ?? null;
};

export interface FilledParticipantGroup<P> {
  key: string;
  name: string | null;
  participants: P[];
}

/**
 * Groups the participants that have a team for display. Unpaired divisions get a
 * single unnamed group sorted by `compare`, so their rendering is unchanged.
 */
export const groupFilledParticipants = <P extends { table: PairableTable; team?: unknown }>(
  participants: P[],
  compare: (a: P, b: P) => number
): FilledParticipantGroup<P>[] => {
  const tables = participants.map(p => p.table);
  if (!tables.some(table => table.pairKey)) {
    return [
      { key: 'all', name: null, participants: participants.filter(p => p.team).sort(compare) }
    ];
  }

  return groupParticipantsByPair(participants, tables)
    .map(group => ({
      key: group.key,
      name: group.name as string | null,
      participants: group.sides.flatMap(side => (side.participant?.team ? [side.participant] : []))
    }))
    .filter(group => group.participants.length > 0);
};
