import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads all GraphQL schema files for the LEMS API.
 * Schema files are organized by domain (events, divisions, teams, volunteers).
 * The base.graphql file defines the root Query type and common types.
 *
 * @returns Array of GraphQL schema strings ready to be combined
 *
 * @example
 * import { loadLemsGraphQLSchema } from '@lems/types/api/lems/graphql';
 *
 * const typeDefs = loadLemsGraphQLSchema();
 * const server = new ApolloServer({ typeDefs, resolvers });
 */
export function loadLemsGraphQLSchema(): string[] {
  // Using __dirname replacement pattern for ESM compatibility
  const schemaDir = new URL('.', import.meta.url).pathname;
  const schemaFiles = ['base', 'event', 'division', 'team', 'volunteer'];

  return schemaFiles.map(filename => {
    try {
      return readFileSync(join(schemaDir, `${filename}.graphql`), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load LEMS GraphQL schema file: ${filename}.graphql - ${error}`);
    }
  });
}

/**
 * Gets the path to the GraphQL schema directory.
 * Useful for tools that need to reference the schema files directly.
 *
 * @returns Absolute path to the schema directory
 */
export function getLemsGraphQLSchemaDir(): string {
  return new URL('.', import.meta.url).pathname;
}
