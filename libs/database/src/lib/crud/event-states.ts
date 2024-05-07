import { Filter, ObjectId } from 'mongodb';
import { EventState } from '@lems/types';
import db from '../database';

export const getEventState = (filter: Filter<EventState>) => {
  return db.collection<EventState>('division-states').findOne(filter);
};

export const getEventStateFromEvent = (divisionId: ObjectId) => {
  return db.collection<EventState>('division-states').findOne({ divisionId });
};

export const addEventState = (state: EventState) => {
  return db
    .collection<EventState>('division-states')
    .insertOne(state)
    .then(response => response);
};

export const updateEventState = (
  filter: Filter<EventState>,
  newEventState: Partial<EventState>,
  upsert = false
) => {
  return db
    .collection<EventState>('division-states')
    .updateOne(filter, { $set: newEventState }, { upsert });
};

export const deleteEventState = (filter: Filter<EventState>) => {
  return db
    .collection<EventState>('division-states')
    .deleteOne(filter)
    .then(response => response);
};
