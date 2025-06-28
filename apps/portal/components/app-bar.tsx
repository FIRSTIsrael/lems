import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './language-switcher';

const pages = [
  {
    name: 'events',
    href: '/events'
  },
  {
    name: 'scorer',
    href: '/scorer'
  }
];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const t = useTranslations('components:app-bar');

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="mobile menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={event => setAnchorElNav(event.currentTarget)}
              color="inherit"
            >
              <MenuIcon />
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
          </Box>

          {/* Desktop */}
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
                sx={{ my: 2, mx: 1, color: 'white', display: 'block' }}
              >
                {t(page.name)}
              </Button>
            ))}
          </Box>
          
          {/* Desktop Language Switcher */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
