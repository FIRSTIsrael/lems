'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Tab,
  Tabs,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export default function SearchSection() {
  const tSearch = useTranslations('pages.index.search');
  const [searchValue, setSearchValue] = React.useState('');
  const [searchTab, setSearchTab] = React.useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {tSearch('title')}
          </Typography>

          <Box>
            <Tabs
              value={searchTab}
              onChange={(_, newValue) => setSearchTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label={tSearch('teams-tab')} />
              <Tab label={tSearch('events-tab')} />
            </Tabs>

            <TextField
              fullWidth
              placeholder={tSearch('placeholder')}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button variant="contained" size="small" sx={{ minWidth: 'auto' }}>
                      {tSearch('search-button')}
                    </Button>
                  </InputAdornment>
                )
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
    </Container>
  );
}
