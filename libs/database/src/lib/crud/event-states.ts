import { Filter, ObjectId } from 'mongodb';
import { EventState } from '@lems/types';
import db from '../database';

export const getEventState = (filter: Filter<EventState>) => {
  return db.collection<EventState>('event-states').findOne(filter);
};

export const getEventStateFromEvent = (eventId: ObjectId) => {
  return db.collection<EventState>('event-states').findOne({ event: eventId });
};

export const addEventState = (state: EventState) => {
  return db
    .collection<EventState>('event-states')
    .insertOne(state)
    .then(response => response);
};

export const updateEventState = (
  filter: Filter<EventState>,
  newEventState: Partial<EventState>
) => {
  return db
    .collection<EventState>('event-states')
    .updateOne(filter, { $set: newEventState }, { upsert: true });
};

export const deleteEventState = (filter: Filter<EventState>) => {
  return db
    .collection<EventState>('event-states')
    .deleteOne(filter)
    .then(response => response);
};
