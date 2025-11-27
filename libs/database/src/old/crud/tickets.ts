import db from '../database';
import { Filter, ObjectId } from 'mongodb';

export const getTicket = (filter: Filter<any>) => {
  return db.collection<any>('tickets').findOne(filter);
};

export const getDivisionTickets = (divisionId: ObjectId) => {
  return db.collection<any>('tickets').find({ divisionId: divisionId }).toArray();
};

export const addTicket = (ticket: any) => {
  return db.collection<any>('tickets').insertOne(ticket);
};

export const addTickets = (tickets: Array<any>) => {
  return db.collection<any>('tickets').insertMany(tickets);
};

export const updateTicket = (filter: Filter<any>, newTicket: Partial<any>, upsert = false) => {
  return db.collection<any>('tickets').updateOne(filter, { $set: newTicket }, { upsert });
};

export const deleteTicket = (filter: Filter<any>) => {
  return db.collection<any>('tickets').deleteOne(filter);
};

export const deleteDivisionTickets = (divisionId: ObjectId) => {
  return db.collection<any>('tickets').deleteMany({ divisionId: divisionId });
};
