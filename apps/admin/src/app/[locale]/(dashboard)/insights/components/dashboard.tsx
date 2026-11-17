'use client';

import { Grid } from '@mui/material';
import { WidgetProps } from './widgets/common';
import { getDashboardWidgets, INSIGHTS_WIDGETS, InsightsDashboardId } from './widgets/registry';

interface DashboardProps extends WidgetProps {
  dashboard: InsightsDashboardId;
}

export const Dashboard: React.FC<DashboardProps> = ({ dashboard, ...widgetProps }) => (
  <Grid container spacing={2}>
    {getDashboardWidgets(dashboard, widgetProps.edition).map(widgetId => {
      const { component: Widget, size } = INSIGHTS_WIDGETS[widgetId];
      return (
        <Grid key={widgetId} size={size}>
          <Widget {...widgetProps} />
        </Grid>
      );
    })}
  </Grid>
);
