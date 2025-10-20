'use client';

import { Typography, Button, Box, Chip, Grid } from '@mui/material';

interface Division {
  id: string;
  name: string;
  color: string;
  teamCount: number;
}

interface DivisionSelectorProps {
  divisions: Division[];
  currentDivisionId?: string;
  onDivisionSelect: (divisionId: string) => void;
}

export const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  divisions,
  currentDivisionId,
  onDivisionSelect
}) => {
  return (
    <Grid container direction="row" spacing={2} mb={3}>
      {divisions.map(division => {
        const isActive = division.id === currentDivisionId;
        return (
          <Grid size={{ xs: 6, md: 3 }} key={division.id}>
            <Button
              key={division.id}
              variant={isActive ? 'contained' : 'outlined'}
              onClick={() => onDivisionSelect(division.id)}
              fullWidth
              sx={{
                borderRadius: 3,
                borderColor: division.color,
                backgroundColor: isActive ? division.color : 'transparent',
                justifyContent: 'space-between',
                px: 2,
                py: 1.25,
                '&:hover': {
                  backgroundColor: isActive ? division.color : `${division.color}15`
                }
              }}
              endIcon={
                <Chip
                  size="small"
                  label={division.teamCount}
                  sx={{
                    height: 18,
                    borderRadius: 2,
                    '& .MuiChip-label': {
                      fontSize: '0.65rem',
                      p: 1,
                      fontWeight: 500
                    },
                    backgroundColor: isActive ? 'rgba(255,255,255,0.35)' : `${division.color}20`,
                    color: isActive ? 'white' : division.color
                  }}
                />
              }
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  width={12}
                  height={12}
                  borderRadius="100%"
                  bgcolor={isActive ? 'white' : division.color}
                />
                <Typography
                  variant="button"
                  color={isActive ? 'white' : division.color}
                  lineHeight={1.25}
                >
                  {division.name}
                </Typography>
              </Box>
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
};
