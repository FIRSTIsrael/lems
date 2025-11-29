'use client';

import { useTranslations } from 'next-intl';
import { Container, Paper, Typography, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const t = useTranslations('pages.api-docs');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('description')}
        </Typography>
      </Paper>

      <Box
        sx={{
          '& .swagger-ui': {
            fontFamily: 'inherit'
          },
          '& .swagger-ui .info': {
            marginBottom: '20px'
          }
        }}
      >
        <SwaggerUI
          url={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333'}/api-docs/openapi.json`}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          displayRequestDuration={true}
          filter={true}
          tryItOutEnabled={true}
        />
      </Box>
    </Container>
  );
}
