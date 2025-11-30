import { ObjectId } from 'mongodb';

/**
 * Transforms a MongoDB ObjectId or string ID into a string format suitable for GraphQL.
 * If the input is an ObjectId, converts it to its string representation.
 * If the input is already a string, returns it as-is.
 *
 * @param id - The ObjectId or string to transform
 * @returns String representation of the ID
 *
 * @example
 * const mongoId = new ObjectId();
 * const graphqlId = toGraphQLId(mongoId);
 * // graphqlId is a string like "507f1f77bcf86cd799439011"
 */
export function toGraphQLId(id: ObjectId | string): string {
  if (id instanceof ObjectId) {
    return id.toString();
  }
  return id;
}
