'use client';

import { Paper, Typography, useTheme, Box, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children, onBack }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: `2px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onBack && (
            <IconButton
              onClick={onBack}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark'
                }
              }}
              aria-label="Go back"
            >
              <DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />
            </IconButton>
          )}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mt: 0.5,
                  fontSize: '0.875rem'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box>{children}</Box>
      </Box>
    </Paper>
  );
};
