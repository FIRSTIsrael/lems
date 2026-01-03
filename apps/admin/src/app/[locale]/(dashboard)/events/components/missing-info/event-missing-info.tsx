'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { MissingInfoAlert } from './missing-info-alert';
import { MissingInfoDialog } from './missing-info-dialog';

interface EventMissingInfoProps {
  divisions: Division[] | { id: string; name: string; color: string }[];
  isFullySetUp: boolean;
  onShowDetails?: () => void;
}

export const EventMissingInfo: React.FC<EventMissingInfoProps> = ({
  divisions,
  isFullySetUp,
  onShowDetails
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasDetailedData = divisions.length > 0 && 'hasAwards' in divisions[0];

  const getMissingItemsCount = (): number => {
    if (!hasDetailedData) return 0;

    let count = 0;
    divisions.forEach(division => {
      const fullDivision = division as Division;
      if (!fullDivision.hasAwards) count++;
      if (!fullDivision.hasUsers) count++;
      if (!fullDivision.hasSchedule) count++;
    });
    return count;
  };

  const missingItemsCount = getMissingItemsCount();

  return (
    <Box>
      <MissingInfoAlert
        isFullySetUp={isFullySetUp}
        hasDetailedData={hasDetailedData}
        missingItemsCount={missingItemsCount}
        onShowDetails={() => setDialogOpen(true)}
      />

      <MissingInfoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        divisions={divisions}
      />
    </Box>
  );
};
