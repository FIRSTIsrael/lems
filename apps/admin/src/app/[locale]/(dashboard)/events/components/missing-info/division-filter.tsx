'use client';

import { Box, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface Division {
  id: string;
  name: string;
  color: string;
}

interface DivisionFilterProps {
  divisions: Division[];
  selectedDivisions: string[];
  onSelectionChange: (divisionIds: string[]) => void;
}

export const DivisionFilter: React.FC<DivisionFilterProps> = ({
  divisions,
  selectedDivisions,
  onSelectionChange
}) => {
  const t = useTranslations('pages.events.missing-info');

  const handleChipClick = (divisionId: string) => {
    if (selectedDivisions.includes(divisionId)) {
      onSelectionChange(selectedDivisions.filter(id => id !== divisionId));
    } else {
      onSelectionChange([...selectedDivisions, divisionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDivisions.length === divisions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(divisions.map(d => d.id));
    }
  };

  if (divisions.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
        {t('filter-divisions')}:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          label={t('all-divisions')}
          onClick={handleSelectAll}
          variant={selectedDivisions.length === divisions.length ? 'filled' : 'outlined'}
          color={selectedDivisions.length === divisions.length ? 'primary' : 'default'}
          size="small"
        />
        {divisions.map(division => (
          <Chip
            key={division.id}
            label={division.name}
            onClick={() => handleChipClick(division.id)}
            variant={selectedDivisions.includes(division.id) ? 'filled' : 'outlined'}
            size="small"
            sx={{
              backgroundColor: selectedDivisions.includes(division.id)
                ? `${division.color}40`
                : 'transparent',
              borderColor: division.color,
              color: selectedDivisions.includes(division.id) ? 'white' : division.color,
              '&:hover': {
                backgroundColor: `${division.color}20`
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
