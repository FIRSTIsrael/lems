'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button,
  ListItemIcon,
  useMediaQuery
} from '@mui/material';
import {
  AssignmentOutlined,
  CalculateOutlined,
  Group,
  Event,
  MenuRounded
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link } from '../../../i18n/navigation';
import { LanguageSwitcher } from './language-switcher';

const pages = [
  { name: 'teams', href: '/teams', icon: <Group /> },
  { name: 'events', href: '/events', icon: <Event /> },
  { name: 'scorer', href: '/tools/scorer', icon: <CalculateOutlined /> },
  { name: 'rubrics', href: '/tools/rubrics', icon: <AssignmentOutlined /> }
];

interface PortalAppBarProps {
  children: React.ReactNode;
}

export const PortalAppBar: React.FC<PortalAppBarProps> = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <React.Fragment>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>{isDesktop ? <DesktopAppBar /> : <MobileAppBar />}</Toolbar>
        </Container>
      </AppBar>
      {children}
    </React.Fragment>
  );
};

const DesktopAppBar: React.FC = () => {
  const t = useTranslations('layouts.main.app-bar');

  return (
    <>
      <Box
        display={{ xs: 'none', md: 'flex' }}
        mr={1}
        height="44px"
        width="164px"
        position="relative"
        sx={{ cursor: 'pointer' }}
        component={Link}
        href="/"
      >
        <Image
          src="/assets/first-israel-horizontal-reverse.svg"
          alt=""
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {pages.map(page => (
          <Button
            key={page.name}
            LinkComponent={Link}
            href={page.href}
            sx={{ my: 2, mx: 1, color: 'white' }}
            startIcon={page.icon}
          >
            {t(page.name)}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <LanguageSwitcher />
      </Box>
    </>
  );
};

const MobileAppBar: React.FC = () => {
  const t = useTranslations('layouts.main.app-bar');
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  return (
    <>
      {' '}
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          aria-label="mobile menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={event => setAnchorElNav(event.currentTarget)}
          color="inherit"
        >
          <MenuRounded />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          open={Boolean(anchorElNav)}
          onClose={() => setAnchorElNav(null)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {pages.map(page => (
            <MenuItem key={page.name} component={Link} href={page.href}>
              <ListItemIcon>{page.icon}</ListItemIcon>
              <Typography sx={{ textAlign: 'center' }}>{t(page.name)}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box
        width="100%"
        display={{ xs: 'flex', md: 'none' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box
          mr={1}
          height="44px"
          width="164px"
          position="relative"
          sx={{ cursor: 'pointer' }}
          component={Link}
          href="/"
        >
          <Image
            src="/assets/first-israel-horizontal-reverse.svg"
            alt=""
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Box>
      {/* Mobile Language Switcher */}
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <LanguageSwitcher />
      </Box>{' '}
    </>
  );
};
