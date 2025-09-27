import { Admin as DbAdmin } from '@lems/database';
import { AdminUser } from '@lems/types/api/admin';

/**
 * Transforms a user object into a response format.
 * Removes sensitive information and formats the response.
 * @param user - The user object to transform.
 */
export const makeAdminUserResponse = (user: DbAdmin): AdminUser => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at
});
