import { RobotGameTable as DbTable } from '@lems/database';
import { RobotGameTable } from '@lems/types/api/admin';

/**
 * Transforms a table object into a response format.
 * @param table - The table object to transform.
 */
export const makeAdminTableResponse = (table: DbTable): RobotGameTable => ({
  id: table.id,
  name: table.name
});
