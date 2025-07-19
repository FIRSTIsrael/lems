import {
  Box,
  Toolbar,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

interface AppBarProps {
  width: number;
}

const AppBar: React.FC<AppBarProps> = ({ width }) => {
  return (
    <Drawer
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box'
        }
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar width={drawerWidth} />
      <Box component="main" sx={{ flexGrow: 1, pl: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
