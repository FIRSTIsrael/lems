'use client';

import { Box, Theme, alpha } from '@mui/material';

export interface SearchResult {
  type: 'team' | 'event';
  id: string;
  title: string;
  location: string;
  description: string;
  slug: string;
  logoUrl?: string | null;
  region: string;
}

export const getUrl = (result: SearchResult) => {
  let url = '/';

  switch (result.type) {
    case 'team':
      url += 'teams/';
      break;
    case 'event':
      url += 'events/';
      break;
    default:
      break;
  }

  url += result.slug;
  return url;
};

export const highlightText = (text: string, highlight: string, theme: Theme) => {
  if (!highlight) return text;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <Box
        key={index}
        component="span"
        fontWeight="bold"
        px={0.5}
        borderRadius={0.5}
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.2)
        }}
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};
