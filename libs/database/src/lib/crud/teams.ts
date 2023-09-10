import { Filter, ObjectId } from 'mongodb';
import { Team } from '@lems/types';
import db from '../database';
import { ReplaceResult } from '../types/responses';

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

export const addTeams = (teams: Team[]) => {
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

export const replaceEventTeams = async (eventId: ObjectId, newTeams: Team[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteEventTeams(eventId);
  if (deleteResponse.acknowledged) {
    response.deletedCount = deleteResponse.deletedCount;

    const insertResponse = await addTeams(newTeams);
    if (insertResponse.acknowledged) {
      response.acknowledged = true;
      response.insertedCount = insertResponse.insertedCount;
      response.insertedIds = insertResponse.insertedIds;
    }
  }

  return response;
};
