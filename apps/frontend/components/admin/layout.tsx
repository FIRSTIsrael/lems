import { Box } from '@mui/material';
import { AdminAppBar } from './app-bar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
