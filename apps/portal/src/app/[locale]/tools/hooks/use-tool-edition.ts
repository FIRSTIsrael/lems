'use client';

import { useSearchParams } from 'next/navigation';
import { parseEdition, type Edition } from '@lems/shared/edition';

export const useToolEdition = (): Edition => parseEdition(useSearchParams().get('edition'));
