'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { AdminUserResponse } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';

interface UserMenuProps {
  user: AdminUserResponse;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const t = useTranslations('layouts.dashboard.user-menu');
  const router = useRouter();

  const avatarRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch('/admin/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      router.push('/login');
    }
  };

  const getInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{ mr: 1 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} ref={avatarRef}>
          {getInitial(user.firstName)}
        </Avatar>
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { opacity: 0.7 },
          minWidth: 100
        }}
        onClick={() => setOpen(true)}
      >
        {getFullName(user.firstName, user.lastName)}
      </Typography>
      <Menu
        anchorEl={avatarRef.current}
        open={open}
        id="user-menu"
        onClose={() => setOpen(false)}
        onClick={() => setOpen(false)}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              borderRadius: 1,
              minWidth: 180,
              py: 0.5,
              '& .MuiMenuItem-root': {
                py: 1
              },
              // Tooltip arrow
              '&::after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 0,
                left: 18,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(50%) rotate(45deg)',
                zIndex: 0
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: -5, vertical: -10 }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};
