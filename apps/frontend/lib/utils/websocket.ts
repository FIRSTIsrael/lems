import { Manager, Socket } from 'socket.io-client';
import { WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';

const getWsBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_WS_URL : process.env.NEXT_PUBLIC_WS_URL;
};

const url = getWsBase();
const manager = new Manager(url ? url : '', {
  autoConnect: false,
  withCredentials: true
});

export const getSocket = (
  eventId: string
): Socket<WSServerEmittedEvents, WSClientEmittedEvents> => {
  return manager.socket(`/event/${eventId}`);
};
