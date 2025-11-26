'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  ClickAwayListener,
  Fade,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Group,
  Event,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Flag } from '@lems/shared';
import { useSearch } from './homepage/search/use-search';
import { SearchResultAvatar } from './homepage/search/search-result-avatar';
import { getUrl, highlightText } from './homepage/search/utils';

export const NavSearch = () => {
  const t = useTranslations('pages.index.search');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const iconColor = isMobile ? theme.palette.text.secondary : theme.palette.primary.main;
  const textColor = isMobile ? theme.palette.text.primary : theme.palette.primary.main;
  const containerStyle = isMobile ? { mt: 0.5, mb: 1 } : { minWidth: 260, maxWidth: 420, mx: 2 };

  return (
    <ClickAwayListener onClickAway={clearSearch}>
      <Box ref={anchorRef} flexShrink={1} display="flex" alignItems="center" sx={containerStyle}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          slotProps={{
            input: {
              style: {
                color: textColor
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: iconColor }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <Fade in={!!query}>
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon sx={{ color: iconColor }} />
                    </IconButton>
                  </Fade>
                </InputAdornment>
              )
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
                  {t('searching')}...
                </Typography>
              </MenuItem>
            )}

            {error && (
              <MenuItem disabled>
                <Typography variant="body2" color="error">
                  {t('error', { error })}
                </Typography>
              </MenuItem>
            )}

            {noResults && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {t('no-results')}
                </Typography>
              </MenuItem>
            )}

            {!noResults && (
              <>
                <MenuItem disabled sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {t('results-count', { count: searchStats.total })}
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
                      window.location.href = getUrl(result);
                    }}
                    sx={{ py: 1.5, textDecoration: 'none', color: 'inherit' }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <SearchResultAvatar resultType={result.type} src={result.logoUrl} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {highlightText(result.title, query, theme)}
                          </Typography>
                        </Stack>
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
                        label={t(`type-${result.type}`)}
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
                      {t('more-results', { count: searchResults.length - 8 })}
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
