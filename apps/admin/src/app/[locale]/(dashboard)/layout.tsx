import { useTranslations } from 'next-intl';
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
import {
  CalendarMonthOutlined,
  PersonOutlined,
  EmojiEventsOutlined,
  GroupOutlined,
  InsightsOutlined,
  DataObjectOutlined
} from '@mui/icons-material';
import { PermissionType } from '@lems/database';
import {
  AdminUserPermissionsResponseSchema,
  AdminUser,
  AdminUserResponseSchema
} from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { Link } from '../../../i18n/navigation';
import { DialogProvider } from './components/dialog-provider';
import { SessionProvider } from './components/session-context';
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
    icon: <CalendarMonthOutlined />,
    label: 'seasons',
    route: 'seasons'
  },
  MANAGE_TEAMS: {
    icon: <GroupOutlined />,
    label: 'teams',
    route: 'teams'
  },
  MANAGE_EVENTS: {
    icon: <EmojiEventsOutlined />,
    label: 'events',
    route: 'events'
  },
  VIEW_INSIGHTS: {
    icon: <InsightsOutlined />,
    label: 'insights',
    route: 'insights'
  },
  MANAGE_USERS: {
    icon: <PersonOutlined />,
    label: 'users',
    route: 'users'
  }
};

interface AppBarProps {
  width: number;
  permissions: PermissionType[];
  user: AdminUser;
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
            <Image src="/admin/assets/FLLC-Logo.svg" alt="" fill />
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
      <List>
        <Link href="/dev/graphql">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <DataObjectOutlined />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.graphql')} />
            </ListItemButton>
          </ListItem>
        </Link>
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
    apiFetch('/admin/users/permissions/me', {}, AdminUserPermissionsResponseSchema),
    apiFetch('/admin/users/me', {}, AdminUserResponseSchema)
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
      <SessionProvider value={{ permissions, user }}>
        <DialogProvider>
          <Box sx={{ display: 'flex' }}>
            <AppBar width={drawerWidth} permissions={permissions} user={user} />
            <Box component="main" sx={{ flexGrow: 1, px: 3, pt: 2 }}>
              {children}
            </Box>
          </Box>
        </DialogProvider>
      </SessionProvider>
    </PermissionGuard>
  );
}
