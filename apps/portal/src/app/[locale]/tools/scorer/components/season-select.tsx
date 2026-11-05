'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Season } from '@lems/types/api/portal';
import { DEFAULT_SCORESHEET_SEASON, SCORESHEET_SEASONS } from '@lems/shared/scoresheet';
import { useToolSeason } from '../hooks/use-tool-scoresheet';

export const SeasonSelect: React.FC = () => {
  const t = useTranslations('pages.tools.scorer');
  const season = useToolSeason();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: seasons = [] } = useSWR<Season[]>('/portal/seasons');

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_SCORESHEET_SEASON) params.delete('season');
    else params.set('season', value);
    // Edition only applies to the current season's scoresheet
    if (value !== DEFAULT_SCORESHEET_SEASON) params.delete('edition');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="scorer-season-label">{t('season')}</InputLabel>
      <Select
        labelId="scorer-season-label"
        label={t('season')}
        value={season}
        onChange={e => handleChange(e.target.value)}
      >
        {SCORESHEET_SEASONS.map(slug => (
          <MenuItem key={slug} value={slug}>
            {seasons.find(s => s.slug === slug)?.name ?? slug.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
