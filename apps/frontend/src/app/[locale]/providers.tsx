'use client';

import { ApolloProvider } from '@apollo/client/react';
import { SWRProvider } from '@lems/shared';
import { createApolloClient } from '../../lib/graphql/client';

const apollo = createApolloClient();

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper for Apollo Client and SWR
 * This component must be a client component to use ApolloProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apollo}>
      <SWRProvider>{children}</SWRProvider>
    </ApolloProvider>
  );
}
