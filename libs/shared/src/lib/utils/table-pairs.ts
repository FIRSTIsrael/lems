export type TableSide = 'A' | 'B';

export const TABLE_SIDES: readonly TableSide[] = ['A', 'B'];

export interface PairableTable {
  id: string;
  name: string;
  pairKey: string;
  side: string;
}

export interface TableGroup<T extends PairableTable> {
  key: string;
  tables: T[];
}

export interface ParticipantPairGroup<P> {
  key: string;
  sides: { table: PairableTable; participant: P | null }[];
}

const sideRank = (side: string): number => {
  const index = TABLE_SIDES.indexOf(side as TableSide);
  return index === -1 ? TABLE_SIDES.length : index;
};

/**
 * Groups tables by pairKey. Each group is ordered A then B, and groups keep
 * the input order of their first table.
 */
export function groupTablesByPair<T extends PairableTable>(tables: T[]): TableGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const table of tables) {
    const group = groups.get(table.pairKey);
    if (group) {
      group.push(table);
    } else {
      groups.set(table.pairKey, [table]);
    }
  }

  return [...groups.entries()].map(([key, groupTables]) => ({
    key,
    tables: [...groupTables].sort((a, b) => sideRank(a.side) - sideRank(b.side))
  }));
}

/**
 * Sorts tables by name (numeric-aware) and keeps each pair adjacent.
 */
export function orderTablesByPair<T extends PairableTable>(tables: T[]): T[] {
  const sorted = [...tables].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  );
  return groupTablesByPair(sorted).flatMap(group => group.tables);
}

/**
 * Returns the ids of the first table of every pair group except the first group.
 */
export function getPairStartIds(orderedTables: PairableTable[]): Set<string> {
  const groups = groupTablesByPair(orderedTables);
  return new Set(groups.slice(1).map(group => group.tables[0].id));
}

/**
 * Groups ordered tables by pair, attaching each table's participant (or null).
 */
export function groupParticipantsByPair<P extends { table: { id: string } }>(
  participants: P[],
  tables: PairableTable[]
): ParticipantPairGroup<P>[] {
  return groupTablesByPair(orderTablesByPair(tables)).map(group => ({
    key: group.key,
    sides: group.tables.map(table => ({
      table,
      participant: participants.find(participant => participant.table.id === table.id) ?? null
    }))
  }));
}

/**
 * Returns the participant at the other table of the given table's pair, or null.
 */
export function getPairedParticipant<P extends { table: { id: string } }>(
  participants: P[],
  tableId: string,
  tables: PairableTable[]
): P | null {
  const group = groupTablesByPair(orderTablesByPair(tables)).find(g =>
    g.tables.some(table => table.id === tableId)
  );
  const partner = group?.tables.find(table => table.id !== tableId);
  if (!partner) return null;
  return participants.find(participant => participant.table.id === partner.id) ?? null;
}

export interface FilledPairGroup<P> {
  key: string;
  participants: P[];
}

/**
 * Groups participants by their table's pair, in pair order. Empty sides are dropped,
 * and so are pairs with no participants.
 */
export function groupFilledParticipantsByPair<P extends { table: { id: string } }>(
  participants: P[],
  tables: PairableTable[]
): FilledPairGroup<P>[] {
  return groupParticipantsByPair(participants, tables)
    .map(group => ({
      key: group.key,
      participants: group.sides.flatMap(side => (side.participant ? [side.participant] : []))
    }))
    .filter(group => group.participants.length > 0);
}
