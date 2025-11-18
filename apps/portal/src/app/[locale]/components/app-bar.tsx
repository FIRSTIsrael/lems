'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  TextField,
  InputAdornment,
  Fade,
  Popper,
  ClickAwayListener,
  Paper,
  Stack,
  Chip,
  useTheme
} from '@mui/material';
import {
  AssignmentOutlined,
  CalculateOutlined,
  Group,
  Event,
  MenuRounded,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Flag, ResponsiveComponent } from '@lems/shared';
import { LanguageSwitcher } from './language-switcher';
import { useSearch } from './homepage/search/use-search';
import { SearchResultAvatar } from './homepage/search/search-result-avatar';
import { getUrl, highlightText } from './homepage/search/utils';

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
  return (
    <React.Fragment>
      <AppBar position="static">
        <Container maxWidth="xl">
          <ResponsiveComponent desktop={<DesktopAppBar />} mobile={<MobileAppBar />} />
        </Container>
      </AppBar>
      {children}
    </React.Fragment>
  );
};

const DesktopAppBar: React.FC = () => {
  const t = useTranslations('layouts.main.app-bar');

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Toolbar disableGutters>
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
      {mounted && <DesktopSearch />}

      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <LanguageSwitcher />
      </Box>
    </Toolbar>
  );
};

const DesktopSearch: React.FC = () => {
  const tSearch = useTranslations('pages.index.search');
  const theme = useTheme();

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const { query, setQuery, searchResults, isValid, isSearching, clearSearch, error } = useSearch();

  const noResults = searchResults.length === 0 && isValid && !isSearching && !error;

  const searchStats = searchResults.reduce(
    (acc, r) => {
      acc.total++;
      if (r.type === 'team') acc.teams++;
      if (r.type === 'event') acc.events++;
      return acc;
    },
    { total: 0, teams: 0, events: 0 }
  );

  return (
    <ClickAwayListener onClickAway={clearSearch}>
      <Box
        ref={anchorRef}
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          minWidth: 260,
          maxWidth: 420,
          mx: 2,
          flexShrink: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={tSearch('placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <Fade in={!!query}>
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon sx={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  </Fade>
                </InputAdornment>
              )
            }
          }}
          inputProps={{
            style: {
              color: theme.palette.primary.main
            }
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 4
          }}
        />

        <Popper
          open={!!query && (isValid || isSearching)}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ width: anchorRef.current?.offsetWidth, zIndex: 1300 }}
        >
          <Paper
            sx={{
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[8]
            }}
          >
            {isSearching && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {tSearch('searching')}...
                </Typography>
              </MenuItem>
            )}

            {error && (
              <MenuItem disabled>
                <Typography variant="body2" color="error">
                  {tSearch('error', { error })}
                </Typography>
              </MenuItem>
            )}

            {noResults && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {tSearch('no-results')}
                </Typography>
              </MenuItem>
            )}

            {!noResults && (
              <>
                <MenuItem disabled sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {tSearch('results-count', { count: searchStats.total })}
                    </Typography>
                    {searchStats.teams > 0 && (
                      <Chip
                        size="small"
                        icon={<Group sx={{ pl: 0.3 }} />}
                        label={searchStats.teams}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {searchStats.events > 0 && (
                      <Chip
                        size="small"
                        icon={<Event sx={{ pl: 0.3 }} />}
                        label={searchStats.events}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>
                </MenuItem>

                {searchResults.map(result => (
                  <MenuItem
                    key={result.id}
                    onClick={() => {
                      clearSearch();
                      if (typeof window !== 'undefined') {
                        window.location.href = getUrl(result);
                      }
                    }}
                    sx={{ py: 1.5, textDecoration: 'none', color: 'inherit' }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <SearchResultAvatar resultType={result.type} src={result.logoUrl} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {highlightText(result.title, query, theme)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {highlightText(result.location, query, theme)}
                          </Typography>
                          <Flag region={result.region} size={20} />
                        </Stack>
                      </Box>
                      <Chip
                        size="small"
                        label={tSearch(`type-${result.type}`)}
                        variant="outlined"
                        color={result.type === 'team' ? 'primary' : 'secondary'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Stack>
                  </MenuItem>
                ))}

                {searchResults.length > 8 && (
                  <MenuItem disabled sx={{ justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {tSearch('more-results', { count: searchResults.length - 8 })}
                    </Typography>
                  </MenuItem>
                )}
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

const MobileAppBar: React.FC = () => {
  const t = useTranslations('layouts.main.app-bar');
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  return (
    <Toolbar disableGutters>
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

      <LanguageSwitcher />
    </Toolbar>
  );
};
