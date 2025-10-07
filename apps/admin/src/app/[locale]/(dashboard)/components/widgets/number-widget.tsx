import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface NumberWidgetProps {
  value: number;
  description: string;
  icon?: ReactNode;
}

export default function NumberWidget({ value, description, icon }: NumberWidgetProps) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={3} width="100%">
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 88,
                height: 88,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #003d6a 0%, #0059a3 100%)',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 61, 106, 0.25)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  borderRadius: 2
                }
              }}
            >
              {icon}
            </Box>
          )}

          <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 800,
                lineHeight: 1,
                color: 'text.primary',
                fontSize: '2.5rem'
              }}
            >
              {value.toLocaleString()}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: '0.95rem',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                fontWeight: 500
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
