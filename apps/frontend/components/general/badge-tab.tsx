import { Badge, Tab, TabProps, Box } from '@mui/material';
import React from 'react';

interface BadgeTabProps extends TabProps {
  label: string;
  showBadge: boolean;
  value: string;
}

const BadgeTab: React.FC<BadgeTabProps> = ({ label, showBadge, value, ...props }) => {
  return (
    <Tab
      {...props}
      label={
        <Badge variant="dot" color="primary" invisible={!showBadge}>
          <Box px={1}>{label}</Box>
        </Badge>
      }
      value={value}
    />
  );
};

export default BadgeTab;
