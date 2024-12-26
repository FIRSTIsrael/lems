import { useState, useEffect, useCallback } from 'react';
import { WSEventListener, ConnectionStatus, WSRoomName } from '@lems/types';
import { getSocket } from '../lib/utils/websocket';

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;
const HEARTBEAT_INTERVAL = 1000;
const HEARTBEAT_TIMEOUT = 800;
const MAX_HEARTBEAT_FAILURES = 3;

export const useWebsocket = (
  divisionId: string,
  rooms: Array<WSRoomName>,
  init?: (...args: any[]) => void | Promise<void>,
  wsevents?: Array<WSEventListener>
) => {
  const socket = getSocket(divisionId);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'disconnected'
  );
  const [retryCount, setRetryCount] = useState(0);
  const [heartbeatFailures, setHeartbeatFailures] = useState(0);

  const refreshConnection = useCallback(() => {
    setConnectionStatus('connecting');
    socket.disconnect();
    socket.connect();

    return new Promise(resolve => {
      socket.emit('joinRoom', rooms, response => {
        if (response?.ok) {
          setConnectionStatus('connected');
          setRetryCount(0);
          setHeartbeatFailures(0);
          resolve(true);
        } else {
          setConnectionStatus('disconnected');
          resolve(false);
        }
      });
    });
  }, [rooms, socket]);

  const reconnect = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      setConnectionStatus('disconnected');
      return;
    }

    const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));

    const success = await refreshConnection();
    if (!success) {
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount, refreshConnection]);

  const compareArrays = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(item => arr2.includes(item));
  };

  useEffect(() => {
    socket.connect();
    if (!socket.connected) setConnectionStatus('connecting');

    if (init) init();

    const onConnect = () => {
      setConnectionStatus('connected');

      socket.emit('joinRoom', rooms, response => {
        if (!response.ok) {
          setConnectionStatus('disconnected');
          reconnect();
        }
      });
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      reconnect();
    });

    // TODO: Fix typing so that we don't need to ignore typescript
    if (wsevents) {
      for (const event of wsevents) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        socket.on(event.name, event.handler);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error');
      socket.off('disconnect', onDisconnect);

      if (wsevents) {
        for (const event of wsevents) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          socket.off(event.name, event.handler);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const heartbeat = () => {
      let responded = false;

      if (!socket.connected) {
        setConnectionStatus('disconnected');
        reconnect();
        return;
      }

      socket.timeout(HEARTBEAT_TIMEOUT).emit('pingRooms', (err, res) => {
        if (!isActive) return;

        responded = true;
        if (err || !res || !compareArrays(res.rooms, rooms)) {
          setHeartbeatFailures(prev => prev + 1);
          if (heartbeatFailures >= MAX_HEARTBEAT_FAILURES) {
            setConnectionStatus('disconnected');
            reconnect();
          }
        } else {
          setHeartbeatFailures(0);
        }
      });

      timeoutId = setTimeout(() => {
        if (!isActive) return;
        if (!responded) {
          setHeartbeatFailures(prev => prev + 1);
          if (heartbeatFailures >= MAX_HEARTBEAT_FAILURES) {
            setConnectionStatus('disconnected');
            reconnect();
          }
        }
      }, HEARTBEAT_TIMEOUT);
    };

    const intervalId = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    return () => {
      isActive = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [socket, rooms, reconnect, heartbeatFailures]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connectionStatus };
};
