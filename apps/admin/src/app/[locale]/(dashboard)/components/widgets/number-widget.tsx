import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface NumberWidgetProps {
  value: number;
  description: string;
  icon?: ReactNode;
}

export default function NumberWidget({ value, description, icon }: NumberWidgetProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                flexShrink: 0
              }}
            >
              {icon}
            </Box>
          )}

          <Stack spacing={0.5} sx={{ minWidth: 0, mt: 1.5 }}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                color: 'text.primary'
              }}
            >
              {value.toLocaleString()}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '1rem',
                lineHeight: 1.2,
                wordBreak: 'break-word'
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
