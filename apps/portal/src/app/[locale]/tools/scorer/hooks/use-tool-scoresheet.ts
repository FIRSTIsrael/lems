'use client';

import { useSearchParams } from 'next/navigation';
import {
  DEFAULT_SCORESHEET_SEASON,
  getScoresheet,
  hasScoresheet,
  type ScoresheetSchema
} from '@lems/shared/scoresheet';
import { useToolEdition } from '../../hooks/use-tool-edition';

/** Season slug from the `season` query param, falling back to the current season. */
export const useToolSeason = (): string => {
  const season = useSearchParams().get('season');
  return hasScoresheet(season) ? season : DEFAULT_SCORESHEET_SEASON;
};

export const useToolScoresheet = (): ScoresheetSchema =>
  getScoresheet(useToolEdition(), useToolSeason());
