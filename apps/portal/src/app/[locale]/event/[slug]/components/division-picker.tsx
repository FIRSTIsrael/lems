'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Button, Stack, Box, Chip } from '@mui/material';

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

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          {t('select-division')}:
        </Typography>
        {divisions.map(division => {
          const isActive = division.id === currentDivisionId;
          return (
            <Button
              key={division.id}
              variant={isActive ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onDivisionSelect(division.id)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                borderColor: division.color,
                backgroundColor: isActive ? division.color : 'transparent',
                color: isActive ? 'white' : division.color,
                '&:hover': {
                  borderColor: division.color,
                  backgroundColor: isActive ? division.color : `${division.color}15`
                }
              }}
              startIcon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 1,
                    bgcolor: isActive ? 'white' : division.color
                  }}
                />
              }
              endIcon={
                <Chip
                  size="small"
                  label={division.teamCount}
                  sx={{
                    height: 18,
                    minWidth: 18,
                    '& .MuiChip-label': {
                      fontSize: '0.625rem',
                      padding: '0 4px',
                      lineHeight: 1
                    },
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${division.color}20`,
                    color: isActive ? 'white' : division.color
                  }}
                />
              }
            >
              {division.name}
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default DivisionPicker;
