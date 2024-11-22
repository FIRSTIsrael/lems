import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Ticket } from '@lems/types';

export const getTicket = (filter: Filter<Ticket>) => {
  return db.collection<Ticket>('tickets').findOne(filter);
};

export const getDivisionTickets = (divisionId: ObjectId) => {
  return db.collection<Ticket>('tickets').find({ divisionId: divisionId }).toArray();
};

export const addTicket = (ticket: Ticket) => {
  return db.collection<Ticket>('tickets').insertOne(ticket);
};

export const addTickets = (tickets: Array<Ticket>) => {
  return db.collection<Ticket>('tickets').insertMany(tickets);
};

export const updateTicket = (
  filter: Filter<Ticket>,
  newTicket: Partial<Ticket>,
  upsert = false
) => {
  return db.collection<Ticket>('tickets').updateOne(filter, { $set: newTicket }, { upsert });
};

export const deleteTicket = (filter: Filter<Ticket>) => {
  return db.collection<Ticket>('tickets').deleteOne(filter);
};

export const deleteDivisionTickets = (divisionId: ObjectId) => {
  return db.collection<Ticket>('tickets').deleteMany({ divisionId: divisionId });
};
