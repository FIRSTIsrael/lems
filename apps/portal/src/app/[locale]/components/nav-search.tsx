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
  useTheme
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

interface NavSearchProps {
  variant?: 'desktop' | 'menu';
}

export const NavSearch: React.FC<NavSearchProps> = ({ variant = 'desktop' }) => {
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

  const desktopColor = theme.palette.primary.main;
  const iconColor = variant === 'desktop' ? desktopColor : theme.palette.text.secondary;
  const textColor = variant === 'desktop' ? desktopColor : theme.palette.text.primary;

  return (
    <ClickAwayListener onClickAway={clearSearch}>
      <Box
        ref={anchorRef}
        sx={{
          display: variant === 'desktop' ? { xs: 'none', md: 'flex' } : 'flex',
          alignItems: 'center',
          minWidth: variant === 'desktop' ? 260 : undefined,
          maxWidth: variant === 'desktop' ? 420 : undefined,
          mx: variant === 'desktop' ? 2 : 0,
          mt: variant === 'menu' ? 0.5 : 0,
          mb: variant === 'menu' ? 1 : 0,
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
          inputProps={{
            style: {
              color: textColor
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
