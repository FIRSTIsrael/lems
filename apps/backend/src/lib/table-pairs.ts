import type { RobotGameTable } from '@lems/database';
import type { PairableTable } from '@lems/shared/utils';

export const toPairableTable = (table: RobotGameTable): PairableTable => ({
  id: table.id,
  name: table.name,
  pairKey: table.pair_key,
  side: table.side
});
