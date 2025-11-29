'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('pages.graphql-schema');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('description')}
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
