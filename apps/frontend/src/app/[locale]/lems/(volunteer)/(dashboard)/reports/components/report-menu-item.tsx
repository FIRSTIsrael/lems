'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardActionArea, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

interface ReportMenuItemProps {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

export function ReportMenuItem({ path, label, icon }: ReportMenuItemProps) {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const queryString = searchParams.toString();
  const url = `/lems/reports/${path}${queryString ? `?${queryString}` : ''}`;

  return (
    <Link href={url} passHref style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)'
          },
          backgroundColor: theme.palette.background.paper
        }}
      >
        <CardActionArea
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: { xs: 120, sm: 140, md: 160 }
          }}
        >
          {icon && (
            <Box
              sx={{
                fontSize: { xs: 32, sm: 40, md: 48 },
                mb: 1.5,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              color: theme.palette.text.primary,
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            {label}
          </Typography>
        </CardActionArea>
      </Card>
    </Link>
  );
}
