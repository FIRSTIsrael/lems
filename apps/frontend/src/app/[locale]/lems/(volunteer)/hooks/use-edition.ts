import { getEdition, type Edition } from '@lems/shared/edition';
import { useEvent } from '../components/event-context';

export const useEdition = (): Edition => getEdition(useEvent().currentDivision);
