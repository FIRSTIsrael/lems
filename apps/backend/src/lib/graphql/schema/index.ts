import { readFileSync } from 'fs';
import { join } from 'path';

const schemaDir = join(__dirname, './schema');
const baseTypeDefs = readFileSync(join(schemaDir, 'base.graphql'), 'utf-8');
const eventTypeDefs = readFileSync(join(schemaDir, 'event.graphql'), 'utf-8');
const divisionTypeDefs = readFileSync(join(schemaDir, 'division.graphql'), 'utf-8');
const teamTypeDefs = readFileSync(join(schemaDir, 'team.graphql'), 'utf-8');
const volunteerTypeDefs = readFileSync(join(schemaDir, 'volunteer.graphql'), 'utf-8');

export const typeDefs = [
  baseTypeDefs,
  eventTypeDefs,
  divisionTypeDefs,
  teamTypeDefs,
  volunteerTypeDefs
];
