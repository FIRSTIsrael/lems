import { Filter, ObjectId } from 'mongodb';
import { Team } from '@lems/types';
import db from '../database';

export const getTeam = (filter: Filter<Team>) => {
  return db.collection<Team>('teams').findOne(filter);
};

export const getEventTeams = (eventId: ObjectId) => {
  return db.collection<Team>('teams').find({ event: eventId }).toArray();
};

export const addTeam = (team: Team) => {
  return db
    .collection<Team>('teams')
    .insertOne(team)
    .then(response => response);
};

export const addTeams = (teams: Array<Team>) => {
  return db
    .collection<Team>('teams')
    .insertMany(teams)
    .then(response => response);
};

export const updateTeam = (filter: Filter<Team>, newTeam: Partial<Team>) => {
  return db.collection<Team>('teams').updateOne(filter, { $set: newTeam }, { upsert: true });
};

export const deleteTeam = (filter: Filter<Team>) => {
  return db
    .collection<Team>('teams')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventTeams = (eventId: ObjectId) => {
  return db
    .collection<Team>('teams')
    .deleteMany({ event: eventId })
    .then(response => response);
};
