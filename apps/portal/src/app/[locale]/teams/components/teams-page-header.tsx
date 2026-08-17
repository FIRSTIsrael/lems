'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { RichText } from '@lems/localization';
import { Flag } from '@lems/shared';

export const TeamsPageHeader: React.FC = () => {
  const t = useTranslations('pages.teams');
  const router = useRouter();
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || '';

  const { data: regions = [] } = useSWR<string[]>('/portal/teams/regions', {
    fallbackData: []
  });

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams();
    if (newRegion) params.set('region', newRegion);
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Stack spacing={3} sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
          }}
        >
          {<RichText>{tags => t.rich('title', tags)}</RichText>}
        </Typography>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>{t('region.label')}</InputLabel>
          <Select
            value={region}
            label={t('region.label')}
            onChange={e => handleRegionChange(e.target.value)}
            renderValue={value => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {value ? (
                  <>
                    <Flag region={value} size={20} />
                    {value}
                  </>
                ) : (
                  t('region.all')
                )}
              </Box>
            )}
          >
            <MenuItem value="">{t('region.all')}</MenuItem>
            {regions?.map(r => (
              <MenuItem key={r} value={r}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag region={r} size={20} />
                  {r}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
};
