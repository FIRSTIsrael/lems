'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Paper, Stack, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export const SearchSection = () => {
  const t = useTranslations('pages.index.search');
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {t('title')}
        </Typography>

        <Box>
          <TextField
            fullWidth
            placeholder={t('placeholder')}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
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
        </Box>
      </Stack>
    </Paper>
  );
};
