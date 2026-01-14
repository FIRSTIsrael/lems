'use client';

import { ApolloClientProvider } from '../../../../lib/graphql/apollo-client-provider';

export default function IntegrationLayout({ children }: { children: React.ReactNode }) {
  return <ApolloClientProvider>{children}</ApolloClientProvider>;
}
