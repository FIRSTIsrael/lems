import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads all GraphQL schema files from the schema directory.
 * Schema files are organized by domain (events, divisions, teams, volunteers).
 * The base.graphql file defines the root Query type and common types.
 */
function loadSchemaFiles(): string[] {
  const schemaDir = join(__dirname, './schema');
  const schemaFiles = ['base', 'event', 'division', 'team', 'volunteer'];

  return schemaFiles.map(filename => {
    try {
      return readFileSync(join(schemaDir, `${filename}.graphql`), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load schema file: ${filename}.graphql - ${error}`);
    }
  });
}

export const typeDefs = loadSchemaFiles();
