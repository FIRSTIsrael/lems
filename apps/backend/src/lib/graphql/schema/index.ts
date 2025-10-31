import { readFileSync } from 'fs';
import { join } from 'path';

// Read GraphQL schema files
const baseTypeDefs = readFileSync(join(__dirname, 'base.graphql'), 'utf-8');
const eventTypeDefs = readFileSync(join(__dirname, 'event.graphql'), 'utf-8');
const divisionTypeDefs = readFileSync(join(__dirname, 'division.graphql'), 'utf-8');
const teamTypeDefs = readFileSync(join(__dirname, 'team.graphql'), 'utf-8');
const volunteerTypeDefs = readFileSync(join(__dirname, 'volunteer.graphql'), 'utf-8');

export const typeDefs = [
  baseTypeDefs,
  eventTypeDefs,
  divisionTypeDefs,
  teamTypeDefs,
  volunteerTypeDefs
];
