import { getScoresheet, type ScoresheetSchema } from '@lems/shared/scoresheet';
import { useEvent } from '../components/event-context';
import { useEdition } from './use-edition';

/** The scoresheet for the current event's season and the current division's edition. */
export const useScoresheetSchema = (): ScoresheetSchema =>
  getScoresheet(useEdition(), useEvent().seasonSlug);
