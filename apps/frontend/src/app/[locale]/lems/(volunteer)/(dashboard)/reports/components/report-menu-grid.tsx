'use client';

import { Grid, Box } from '@mui/material';
import { ReportMenuItem } from './report-menu-item';

interface ReportItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface ReportMenuGridProps {
  items: ReportItem[];
  divisionId?: string;
}

export function ReportMenuGrid({ items, divisionId }: ReportMenuGridProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {items.map(item => (
          <Grid key={item.path} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ReportMenuItem
              path={item.path}
              label={item.label}
              icon={item.icon}
              divisionId={divisionId}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
