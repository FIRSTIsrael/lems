'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Fade,
  Popper,
  ClickAwayListener,
  MenuItem,
  Chip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Groups as TeamsIcon,
  Event as EventsIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useSearch } from './use-search';
import { SearchResultAvatar } from './search-result-avatar';
import { getUrl, highlightText } from './utils';

export const SearchSection = () => {
  const t = useTranslations('pages.index.search');
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setIsOpen(isValid);
  }, [isValid]);

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {t('title')}
          </Typography>

          <Box ref={anchorRef} sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder={t('placeholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: query && (
                    <InputAdornment position="end">
                      <Fade in={!!query}>
                        <IconButton size="small" onClick={clearSearch}>
                          <ClearIcon />
                        </IconButton>
                      </Fade>
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  paddingRight: 1
                }
              }}
            />

            <Popper
              open={isOpen && (isValid || isSearching)}
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
                            icon={<TeamsIcon />}
                            label={searchStats.teams}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {searchStats.events > 0 && (
                          <Chip
                            size="small"
                            icon={<EventsIcon />}
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
                        component={Link}
                        href={getUrl(result)}
                        onClick={() => setIsOpen(false)}
                        sx={{ py: 1.5, textDecoration: 'none', color: 'inherit' }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ width: '100%' }}
                        >
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
        </Stack>
      </Paper>
    </ClickAwayListener>
  );
};
