import * as React from 'react';
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
import Image from 'next/image';
import { useRouter } from 'next/router';

const pages = [
  {
    name: 'אירועים',
    href: '/events'
  },
  {
    name: 'מחשבון ניקוד',
    href: '/scorer'
  }
];

const ResponsiveAppBar = () => {
  const router = useRouter();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

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
                <MenuItem key={page.name} onClick={() => router.push(page.href)}>
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
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
              onClick={() => router.push('/')}
            >
              <Image
                src="/assets/first-israel-horizontal-reverse.svg"
                alt=""
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Box>

          {/* Desktop */}
          <Box
            display={{ xs: 'none', md: 'flex' }}
            mr={1}
            height="44px"
            width="164px"
            position="relative"
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
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
                onClick={() => router.push(page.href)}
                sx={{ my: 2, mx: 1, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
