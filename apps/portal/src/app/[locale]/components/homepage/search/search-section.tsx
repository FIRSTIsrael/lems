'use client';

import React, { useState, useRef } from 'react';
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
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Groups as TeamsIcon,
  Event as EventsIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { TeamSummary } from '@lems/types/api/portal';
import { useSearch } from '../../../../../hooks/use-search';
import { SearchResultAvatar } from './search-result-avatar';

export const SearchSection = () => {
  const t = useTranslations('pages.index.search');
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    searchResults,
    searchStats,
    isSearching,
    isEmpty,
    hasQuery,
    clearSearch,
    error
  } = useSearch();

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <Box
          key={index}
          component="span"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            fontWeight: 'bold',
            borderRadius: 0.5,
            px: 0.5
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
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
                onChange={e => handleSearchChange(e.target.value)}
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
                          <IconButton size="small" onClick={handleClear}>
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
                open={isOpen && (hasQuery || isSearching)}
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
                        Search error: {error}
                      </Typography>
                    </MenuItem>
                  )}

                  {!isSearching && !error && isEmpty && (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {t('no-results')}
                      </Typography>
                    </MenuItem>
                  )}

                  {!isSearching && !error && searchResults.length > 0 && (
                    <>
                      <MenuItem
                        disabled
                        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
                      >
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

                      {searchResults.slice(0, 8).map(result => (
                        <MenuItem
                          key={result.id}
                          component={Link}
                          href={result.url}
                          onClick={() => setIsOpen(false)}
                          sx={{ py: 1.5, textDecoration: 'none', color: 'inherit' }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{ width: '100%' }}
                          >
                            <SearchResultAvatar
                              resultType={result.type}
                              teamData={
                                result.type === 'team'
                                  ? {
                                      logoUrl: (result.data as TeamSummary).logoUrl || undefined
                                    }
                                  : undefined
                              }
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {highlightText(result.title, query)}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {highlightText(result.subtitle, query)}
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
      </Box>
    </ClickAwayListener>
  );
};
