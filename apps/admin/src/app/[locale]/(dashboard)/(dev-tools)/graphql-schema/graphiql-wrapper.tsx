'use client';

import { useState, useEffect } from 'react';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import type { Fetcher } from '@graphiql/toolkit';
import { Box, CircularProgress } from '@mui/material';
import 'graphiql/setup-workers/webpack';
import 'graphiql/style.css';

// Match the getApiBase logic from @lems/shared
const getApiBase = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
};

export default function GraphiQLWrapper() {
  const [fetcher, setFetcher] = useState<Fetcher | null>(null);

  useEffect(() => {
    // Create fetcher only on client side with the same configuration as Apollo Client
    const apiBase = getApiBase();
    const graphqlUrl = `${apiBase}/lems/graphql`;

    const graphiqlFetcher = createGraphiQLFetcher({
      url: graphqlUrl,
      credentials: 'include'
    });

    setFetcher(() => graphiqlFetcher);
  }, []);

  if (!fetcher) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <GraphiQL fetcher={fetcher} defaultEditorToolsVisibility={true} />;
}
