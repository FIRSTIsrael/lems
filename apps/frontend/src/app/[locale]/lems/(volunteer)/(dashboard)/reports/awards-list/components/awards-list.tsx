'use client';

import { Stack } from '@mui/material';
import { Award } from '../graphql';
import { AwardCard } from './award-card';

interface AwardsListProps {
  groupedAwards: Record<string, Award[]>;
}

export function AwardsList({ groupedAwards }: AwardsListProps) {
  return (
    <Stack spacing={2}>
      {Object.entries(groupedAwards).map(([name, awardList]) => (
        <AwardCard key={name} name={name} awardList={awardList} />
      ))}
    </Stack>
  );
}
