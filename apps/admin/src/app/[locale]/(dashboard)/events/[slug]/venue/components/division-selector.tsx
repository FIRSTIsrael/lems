'use client';

import { FormControl, InputLabel, Select, MenuItem, Avatar, Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';

interface DivisionSelectorProps {
  divisions: Division[];
  selectedDivisionId: string;
  onDivisionChange: (divisionId: string) => void;
}

const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  divisions,
  selectedDivisionId,
  onDivisionChange
}) => {
  const t = useTranslations('pages.events.venue.division-selector');

  if (divisions.length <= 1) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          sx={{
            bgcolor: divisions[0]?.color || '#666',
            color: 'white',
            width: 32,
            height: 32
          }}
        >
          {divisions[0]?.name?.charAt(0) || 'D'}
        </Avatar>
        <Typography variant="h6">
          {divisions.length === 1 ? divisions[0].name : t('single-division')}
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl fullWidth sx={{ maxWidth: 300 }}>
      <InputLabel id="division-selector-label">{t('label')}</InputLabel>
      <Select
        labelId="division-selector-label"
        value={selectedDivisionId}
        label={t('label')}
        onChange={e => onDivisionChange(e.target.value)}
      >
        {divisions.map(division => (
          <MenuItem key={division.id} value={division.id}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: division.color,
                  color: 'white',
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem'
                }}
              >
                {division.name.charAt(0)}
              </Avatar>
              <Typography>{division.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DivisionSelector;
