import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { JudgingClientEmittedEvents, JudgingServerEmittedEvents } from '@lems/types';

const getWsBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_WS_URL : process.env.NEXT_PUBLIC_WS_URL;
};

const url = getWsBase();
export const judgingSocket: Socket<JudgingServerEmittedEvents, JudgingClientEmittedEvents> = io(
  url ? url + '/judging' : '',
  {
    autoConnect: false,
    withCredentials: true
  }
);
