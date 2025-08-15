'use client';

import React, { useState } from 'react';
import { Box, IconButton, Collapse, Stack } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Season } from '@lems/types/api/admin';
import { EventGrid } from './event-grid';
import { SeasonHeader } from './season-header';

interface PreviousSeasonProps {
  season: Season;
}

export const PreviousSeason: React.FC<PreviousSeasonProps> = ({ season }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        mb: 2,
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          p: 3,
          cursor: 'pointer',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        onClick={handleToggle}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <SeasonHeader
            logoUrl={season.logoUrl}
            seasonName={season.name}
            allowCreate={false}
            numberOfEvents={0}
          />
          <IconButton>{isExpanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Stack>
      </Box>

      <Collapse in={isExpanded} sx={{ mt: 2 }}>
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            mb: 4,
            backgroundColor: 'grey.50',
            minHeight: 200
          }}
        >
          <EventGrid events={[]} disableCreation />
        </Box>
      </Collapse>
    </Box>
  );
};
