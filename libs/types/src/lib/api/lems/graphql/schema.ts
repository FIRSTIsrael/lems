import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Loads all GraphQL schema files for the LEMS API.
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
  // Get the directory containing this file
  // In ESM, we need to convert import.meta.url to a file path
  const currentFilePath = fileURLToPath(import.meta.url);
  const schemaDir = dirname(currentFilePath);
  const schemaFiles = ['base', 'event', 'division', 'team', 'volunteer', 'judging'];

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
  const currentFilePath = fileURLToPath(import.meta.url);
  return dirname(currentFilePath);
}
