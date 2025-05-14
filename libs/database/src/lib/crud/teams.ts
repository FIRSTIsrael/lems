import { Filter, ObjectId } from 'mongodb';
import { TeamRegistration } from '@lems/types';
import db from '../database';

export const getTeam = (filter: Filter<TeamRegistration>) => {
  return db.collection<TeamRegistration>('team-registration').findOne(filter);
};

export const getDivisionTeams = (divisionId: ObjectId) => {
  return db.collection<TeamRegistration>('team-registration').find({ divisionId }).toArray();
};

export const addTeam = (team: TeamRegistration) => {
  return db.collection<TeamRegistration>('team-registration').insertOne(team);
};

export const addTeams = (teams: Array<TeamRegistration>) => {
  return db.collection<TeamRegistration>('team-registration').insertMany(teams);
};

export const updateTeam = (
  filter: Filter<TeamRegistration>,
  newTeam: Partial<TeamRegistration>,
  upsert = false
) => {
  return db
    .collection<TeamRegistration>('team-registration')
    .updateOne(filter, { $set: newTeam }, { upsert });
};

export const deleteTeam = (filter: Filter<TeamRegistration>) => {
  return db.collection<TeamRegistration>('team-registration').deleteOne(filter);
};

export const deleteDivisionTeams = (divisionId: ObjectId) => {
  return db.collection<TeamRegistration>('team-registration').deleteMany({ divisionId });
};
