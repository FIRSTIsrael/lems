'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Button, Stack, Box, Chip, useMediaQuery, useTheme } from '@mui/material';

interface Division {
  id: string;
  name: string;
  color: string;
  teamCount: number;
}

interface DivisionPickerProps {
  divisions: Division[];
  currentDivisionId?: string;
  onDivisionSelect: (divisionId: string) => void;
}

const DivisionPicker: React.FC<DivisionPickerProps> = ({
  divisions,
  currentDivisionId,
  onDivisionSelect
}) => {
  const t = useTranslations('pages.event');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper sx={{ 
      p: isMobile ? 2 : 2, 
      mb: 3,
      borderRadius: isMobile ? 3 : 1,
      boxShadow: isMobile ? 2 : 1
    }}>
      <Stack spacing={isMobile ? 1.5 : 2}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: isMobile ? 500 : 400,
            fontSize: isMobile ? '0.875rem' : '0.75rem'
          }}
        >
          {t('select-division')}:
        </Typography>
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={isMobile ? 1 : 2} 
          alignItems={isMobile ? "stretch" : "center"}
          flexWrap={isMobile ? "nowrap" : "wrap"}
        >
          {divisions.map(division => {
            const isActive = division.id === currentDivisionId;
            return (
              <Button
                key={division.id}
                variant={isActive ? 'contained' : 'outlined'}
                size="small"
                onClick={() => onDivisionSelect(division.id)}
                sx={{
                  borderRadius: isMobile ? 3 : 3,
                  textTransform: 'none',
                  borderColor: division.color,
                  backgroundColor: isActive ? division.color : 'transparent',
                  color: isActive ? 'white' : division.color,
                  minWidth: isMobile ? 'auto' : 'fit-content',
                  justifyContent: isMobile ? 'space-between' : 'center',
                  px: isMobile ? 1.5 : 1.5,
                  py: isMobile ? 0.8 : 0.5,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  fontWeight: 500,
                  borderWidth: 1,
                  boxShadow: isMobile && isActive ? 1 : 0,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: division.color,
                    backgroundColor: isActive ? division.color : `${division.color}15`,
                    transform: isMobile ? 'translateY(-0.5px)' : 'none',
                    boxShadow: isMobile ? (isActive ? 2 : 0.5) : 0
                  },
                  '&:active': {
                    transform: isMobile ? 'translateY(0px)' : 'none'
                  }
                }}
                startIcon={
                  <Box
                    sx={{
                      width: isMobile ? 12 : 12,
                      height: isMobile ? 12 : 12,
                      borderRadius: 1,
                      bgcolor: isActive ? 'white' : division.color,
                      transition: 'all 0.15s ease-in-out'
                    }}
                  />
                }
                endIcon={
                  <Chip
                    size="small"
                    label={division.teamCount}
                    sx={{
                      height: isMobile ? 18 : 18,
                      minWidth: isMobile ? 18 : 18,
                      borderRadius: 2,
                      '& .MuiChip-label': {
                        fontSize: isMobile ? '0.65rem' : '0.625rem',
                        padding: '0 4px',
                        lineHeight: 1,
                        fontWeight: 500
                      },
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : `${division.color}20`,
                      color: isActive ? 'white' : division.color,
                      border: 'none'
                    }}
                  />
                }
              >
                {division.name}
              </Button>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DivisionPicker;
