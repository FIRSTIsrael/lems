'use client';

import { EventDetailsDivision } from '@lems/types/api/portal';
import { Grid, Box, Typography, Chip, Button } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

interface DivisionSelectorProps {
  divisions: EventDetailsDivision[];
}

export const DivisionSelector: React.FC<DivisionSelectorProps> = ({ divisions }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;

  if (divisions.length <= 1 || !selectedDivisionId) {
    return null; // This component should only be shown on events with multiple divisions
  }

  const handleDivisionChange = (divisionId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('division', divisionId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Grid container direction="row" spacing={2} mb={3}>
      {divisions.map(division => {
        const isActive = division.id === selectedDivisionId;
        return (
          <Grid size={{ xs: 6, md: 3 }} key={division.id}>
            <Button
              key={division.id}
              variant={isActive ? 'contained' : 'outlined'}
              onClick={() => handleDivisionChange(division.id)}
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
