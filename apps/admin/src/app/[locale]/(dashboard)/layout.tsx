import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
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
import {
  AdminUserPermissionsResponseSchema,
  AdminUserResponse,
  AdminUserResponseSchema
} from '@lems/types/api/admin';
import { apiFetch } from '../../../lib/fetch';
import { DialogProvider } from './components/dialog-provider';
import { PermissionGuard } from './components/permission-guard';
import { UserMenu } from './components/user-menu';

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
  MANAGE_TEAMS: {
    icon: <GroupOutlinedIcon />,
    label: 'teams',
    route: 'teams'
  },
  MANAGE_EVENTS: {
    icon: <EmojiEventsOutlinedIcon />,
    label: 'events',
    route: 'events'
  },
  VIEW_INSIGHTS: {
    icon: <InsightsOutlinedIcon />,
    label: 'insights',
    route: 'insights'
  },
  MANAGE_USERS: {
    icon: <PersonOutlinedIcon />,
    label: 'users',
    route: 'users'
  }
};

interface AppBarProps {
  width: number;
  permissions: PermissionType[];
  user: AdminUserResponse;
}

const AppBar: React.FC<AppBarProps> = ({ width, permissions, user }) => {
  const t = useTranslations('layouts.dashboard');

  return (
    <Drawer
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar>
        <Box width="100%" height="80%" position="relative">
          <Link href="/">
            <Image src="/assets/FLLC-Logo.svg" alt="" fill />
          </Link>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {Object.keys(navigator).map(permissionKey => {
          const permission = permissionKey as PermissionType;
          if (!permissions.includes(permission)) return null;

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
      <Divider />
      <Box sx={{ p: 2 }}>
        <UserMenu user={user} />
      </Box>
    </Drawer>
  );
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const drawerWidth = 240;

  const [permissionsResult, userResult] = await Promise.all([
    apiFetch('/admin/users/permissions/me', undefined, AdminUserPermissionsResponseSchema),
    apiFetch('/admin/users/me', undefined, AdminUserResponseSchema)
  ]);

  if (!permissionsResult.ok) {
    throw new Error(
      `Failed to fetch user permissions: ${permissionsResult.status} ${permissionsResult.statusText}`
    );
  }

  if (!userResult.ok) {
    throw new Error(`Failed to fetch user data: ${userResult.status} ${userResult.statusText}`);
  }

  const { data: permissions } = permissionsResult;
  const { data: user } = userResult;

  return (
    <PermissionGuard permissions={permissions}>
      <DialogProvider>
        <Box sx={{ display: 'flex' }}>
          <AppBar width={drawerWidth} permissions={permissions} user={user} />
          <Box component="main" sx={{ flexGrow: 1, px: 3, pt: 2 }}>
            {children}
          </Box>
        </Box>
      </DialogProvider>
    </PermissionGuard>
  );
}
