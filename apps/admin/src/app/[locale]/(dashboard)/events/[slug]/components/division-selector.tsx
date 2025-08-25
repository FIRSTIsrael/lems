'use client';

import { Box, Typography, Avatar, Chip, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { useRouter, useSearchParams } from 'next/navigation';

interface DivisionSelectorProps {
  divisions: Division[];
}

export const DivisionSelector: React.FC<DivisionSelectorProps> = ({ divisions }) => {
  const t = useTranslations('pages.events.layout.division-selector');
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;

  if (divisions.length <= 1) {
    return null; // This component should only be shown on events with multiple divisions
  }

  const handleDivisionChange = (divisionId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('division', divisionId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        {t('label')}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {divisions.map(division => {
          const isSelected = division.id === selectedDivisionId;
          const divisionColor = division.color || '#666';

          return (
            <Chip
              key={division.id}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: isSelected ? 'white' : divisionColor,
                    color: isSelected ? divisionColor : 'white',
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem'
                  }}
                >
                  {division.name.charAt(0)}
                </Avatar>
              }
              label={division.name}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => handleDivisionChange(division.id)}
              sx={{
                height: 40,
                fontSize: '0.875rem',
                fontWeight: isSelected ? 500 : 400,
                border: `2px solid ${divisionColor}`,
                backgroundColor: isSelected ? divisionColor : 'transparent',
                color: isSelected ? 'white' : divisionColor,
                '&:hover': {
                  backgroundColor: isSelected ? divisionColor : `${divisionColor}20`,
                  border: `2px solid ${divisionColor}`,
                  color: isSelected ? 'white' : divisionColor
                },
                '& .MuiChip-label': {
                  paddingLeft: 2,
                  paddingRight: 2
                },
                '& .MuiChip-avatar': {
                  marginLeft: 1
                },
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer'
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
