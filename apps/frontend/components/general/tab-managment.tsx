import React from 'react';
import { Box } from '@mui/material';

interface TabContextProps {
  children?: React.ReactNode;
  value: string;
}

const TabContext: React.FC<TabContextProps> = ({ value, children }) => {
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === TabPanel) {
      return React.cloneElement(child, { index: value } as React.Attributes);
    }
    return child;
  });
};

interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  index?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export { TabContext, TabPanel };
