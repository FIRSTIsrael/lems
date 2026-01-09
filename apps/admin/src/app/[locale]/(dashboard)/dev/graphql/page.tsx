'use client';

import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';

const GraphiQLWrapper = dynamic(() => import('./graphiql-wrapper'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      <CircularProgress />
    </Box>
  )
});

export default function GraphQLSchemaPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{ p: 2, backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h5" component="h1">
          GraphQL Schema
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Explore and interact with the GraphQL schema for the LEMS application.
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <GraphiQLWrapper />
      </Box>
    </Box>
  );
}
