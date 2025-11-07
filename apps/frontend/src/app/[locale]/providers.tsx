'use client';

import { SWRProvider } from '@lems/shared';
import { ApolloClientProvider } from '../../lib/graphql/apollo-client-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper for Apollo Client and SWR
 * This component wraps children with ApolloWrapper and SWRProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloClientProvider>
      <SWRProvider>{children}</SWRProvider>
    </ApolloClientProvider>
  );
}
