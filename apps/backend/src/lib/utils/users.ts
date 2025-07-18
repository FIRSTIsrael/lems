import { Admin } from '@lems/database';

/**
 * Transforms a user object into a response format.
 * Removes sensitive information and formats the response.
 * @param {Admin} user - The user object to transform.
 */
export const makeUserResponse = (user: Admin) => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at
});
