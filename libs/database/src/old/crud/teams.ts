import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getTeam = (filter: Filter<any>) => {
  return db.collection<any>('teams').findOne(filter);
};

export const getDivisionTeams = (divisionId: ObjectId) => {
  return db.collection<any>('teams').find({ divisionId }).toArray();
};

export const addTeam = (team: any) => {
  return db.collection<any>('teams').insertOne(team);
};

export const addTeams = (teams: Array<any>) => {
  return db.collection<any>('teams').insertMany(teams);
};

export const updateTeam = (filter: Filter<any>, newTeam: Partial<any>, upsert = false) => {
  return db.collection<any>('teams').updateOne(filter, { $set: newTeam }, { upsert });
};

export const deleteTeam = (filter: Filter<any>) => {
  return db.collection<any>('teams').deleteOne(filter);
};

export const deleteDivisionTeams = (divisionId: ObjectId) => {
  return db.collection<any>('teams').deleteMany({ divisionId });
};
