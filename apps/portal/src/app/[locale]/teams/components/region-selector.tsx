'use client';

import { Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

interface RegionSelectorProps {
  selectedRegions: string[];
  availableRegions: string[];
  onRegionsChange: (values: string[]) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegions,
  availableRegions,
  onRegionsChange
}) => {
  const t = useTranslations('pages.teams');

  return (
    <Autocomplete
      multiple
      size="small"
      options={availableRegions}
      value={selectedRegions}
      onChange={(_event, value) => onRegionsChange(value)}
      renderInput={params => (
        <TextField {...params} label={t('region.label')} placeholder={t('region.all')} />
      )}
      sx={{ minWidth: 220, maxWidth: 320 }}
    />
  );
};
