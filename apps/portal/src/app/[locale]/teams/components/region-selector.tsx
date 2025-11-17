'use client';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

interface RegionSelectorProps {
  regionFilter: string;
  availableRegions: string[];
  onRegionChange: (value: string) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  regionFilter,
  availableRegions,
  onRegionChange
}) => {
  const t = useTranslations('pages.teams');

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="teams-region-select-label">{t('region.label')}</InputLabel>
      <Select
        labelId="teams-region-select-label"
        id="teams-region-select"
        label={t('region.label')}
        value={regionFilter}
        onChange={e => onRegionChange(e.target.value)}
      >
        <MenuItem value="all">{t('region.all')}</MenuItem>
        {availableRegions.map(region => (
          <MenuItem key={region} value={region}>
            {region}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
