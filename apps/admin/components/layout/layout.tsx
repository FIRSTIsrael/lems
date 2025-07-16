import { Box } from '@mui/material';
import { AdminAppBar } from './app-bar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminAppBar width={drawerWidth} />
      <Box component="main" sx={{ flexGrow: 1, pl: 3 }}>
        {children}
      </Box>
    </Box>
  );
};
