'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { MissingInfoAlert } from './missing-info-alert';
import { MissingItemsList } from './missing-items-list';
import { type MissingItem } from './missing-info-item';

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
  const [expanded, setExpanded] = useState(false);

  const missingItems: MissingItem[] = [];
  const hasDetailedData = divisions.length > 0 && 'hasAwards' in divisions[0];

  if (hasDetailedData) {
    divisions.forEach(division => {
      const fullDivision = division as Division;

      if (!fullDivision.hasAwards) {
        missingItems.push({
          type: 'awards',
          divisionName: division.name,
          divisionColor: division.color
        });
      }
      if (!fullDivision.hasUsers) {
        missingItems.push({
          type: 'users',
          divisionName: division.name,
          divisionColor: division.color
        });
      }
      if (!fullDivision.hasSchedule) {
        missingItems.push({
          type: 'schedule',
          divisionName: division.name,
          divisionColor: division.color
        });
      }
    });
  }

  return (
    <Box>
      <MissingInfoAlert
        isFullySetUp={isFullySetUp}
        hasDetailedData={hasDetailedData}
        missingItemsCount={missingItems.length}
        expanded={expanded}
        onToggleExpanded={() => setExpanded(!expanded)}
        onShowDetails={onShowDetails}
      />

      {hasDetailedData && <MissingItemsList items={missingItems} expanded={expanded} />}
    </Box>
  );
};
