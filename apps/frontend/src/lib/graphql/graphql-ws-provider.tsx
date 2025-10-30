'use client';

/**
 * GraphQL WebSocket Provider
 * Manages the WebSocket client and connection status globally
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Client } from 'graphql-ws';
import { createGraphQLWSClient, ConnectionStatus } from './ws-client';

interface GraphQLWSContextValue {
  client: Client | null;
  connectionStatus: ConnectionStatus;
}

const GraphQLWSContext = createContext<GraphQLWSContextValue | null>(null);

export interface GraphQLWSProviderProps {
  children: ReactNode;
  url: string;
  divisionId: string;
  userId?: string;
  roles?: string[];
}

/**
 * Provider component that manages the GraphQL WebSocket client
 * Should wrap the app or specific sections that need real-time data
 */
export function GraphQLWSProvider({
  children,
  url,
  divisionId,
  userId,
  roles = []
}: GraphQLWSProviderProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const wsClient = createGraphQLWSClient({
      url,
      connectionParams: () => ({
        divisionId,
        userId,
        roles
      }),
      onStatusChange: setConnectionStatus
    });

    setClient(wsClient);

    return () => {
      wsClient.dispose();
      setClient(null);
    };
  }, [url, divisionId, userId, roles]);

  return (
    <GraphQLWSContext.Provider value={{ client, connectionStatus }}>
      {children}
    </GraphQLWSContext.Provider>
  );
}

/**
 * Hook to access the GraphQL WebSocket client
 */
export function useGraphQLWSClient(): GraphQLWSContextValue {
  const context = useContext(GraphQLWSContext);
  if (!context) {
    throw new Error('useGraphQLWSClient must be used within GraphQLWSProvider');
  }
  return context;
}
