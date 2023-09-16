import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Ticket } from '@lems/types';

export const getTicket = (filter: Filter<Ticket>) => {
  return db.collection<Ticket>('tickets').findOne(filter);
};

export const getEventTickets = (eventId: ObjectId) => {
  return db.collection<Ticket>('tickets').find({ event: eventId }).toArray();
};

export const addTicket = (ticket: Ticket) => {
  return db
    .collection<Ticket>('tickets')
    .insertOne(ticket)
    .then(response => response);
};

export const addTickets = (tickets: Ticket[]) => {
  return db
    .collection<Ticket>('tickets')
    .insertMany(tickets)
    .then(response => response);
};

export const updateTicket = (filter: Filter<Ticket>, newTicket: Partial<Ticket>) => {
  return db.collection<Ticket>('tickets').updateOne(filter, { $set: newTicket }, { upsert: true });
};

export const deleteTicket = (filter: Filter<Ticket>) => {
  return db
    .collection<Ticket>('tickets')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventTickets = (eventId: ObjectId) => {
  return db
    .collection<Ticket>('tickets')
    .deleteMany({ event: eventId })
    .then(response => response);
};
