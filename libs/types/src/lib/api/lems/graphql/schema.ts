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
  const schemaFiles = [
    'base',
    'event',
    'division',
    'team',
    'volunteer',
    'judging',
    'field',
    'rubric',
    'award',
    'scoresheet',
    'deliberations',
    'final-deliberations'
  ];
  const schemaDir = getLemsGraphQLSchemaDir();

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
 *
 * @returns Absolute path to the schema directory
 */
export function getLemsGraphQLSchemaDir(): string {
  if (process.env['NODE_ENV'] === 'production') {
    // Production: in Docker, graphql files are in the graphql subdirectory
    return join(process.cwd(), 'graphql');
  } else {
    // Development: source files location. In ESM, we derive from import.meta.url
    return join(dirname(fileURLToPath(import.meta.url)));
  }
}
