import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { PermissionType } from '@lems/database';
import { AdminUserPermissionsResponseSchema } from '@lems/backend/schemas';
import { apiFetch } from '../../../../lib/fetch';
import { DialogProvider } from './dialog-provider';

type Navigator = {
  [key in PermissionType]?: {
    icon: React.ReactNode;
    label: string;
    route: string;
  };
};

const navigator: Navigator = {
  MANAGE_SEASONS: {
    icon: <CalendarMonthOutlinedIcon />,
    label: 'seasons',
    route: 'seasons'
  },
  MANAGE_USERS: {
    icon: <PersonOutlinedIcon />,
    label: 'users',
    route: 'users'
  },
  MANAGE_EVENTS: {
    icon: <EmojiEventsOutlinedIcon />,
    label: 'events',
    route: 'events'
  },
  MANAGE_TEAMS: {
    icon: <GroupOutlinedIcon />,
    label: 'teams',
    route: 'teams'
  },
  VIEW_INSIGHTS: {
    icon: <InsightsOutlinedIcon />,
    label: 'insights',
    route: 'insights'
  }
};

interface AppBarProps {
  width: number;
  permissions: PermissionType[];
}

const AppBar: React.FC<AppBarProps> = ({ width, permissions }) => {
  const t = useTranslations('layouts.dashboard');

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
        {permissions.map(permission => {
          const navItem = navigator[permission];
          if (!navItem) return null;

          return (
            <Link key={permission} href={`/${navItem.route}`}>
              <ListItem key={permission} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{navItem.icon}</ListItemIcon>
                  <ListItemText primary={t(`sidebar.${navItem.label}`)} />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Drawer>
  );
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const drawerWidth = 240;
  const { data: permissions } = await apiFetch(
    '/admin/users/permissions/me',
    undefined,
    AdminUserPermissionsResponseSchema
  );

  return (
    <DialogProvider>
      <Box sx={{ display: 'flex' }}>
        <AppBar width={drawerWidth} permissions={permissions} />
        <Box component="main" sx={{ flexGrow: 1, pl: 3, pt: 2 }}>
          {children}
        </Box>
      </Box>
    </DialogProvider>
  );
}
