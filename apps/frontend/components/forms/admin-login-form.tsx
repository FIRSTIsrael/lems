import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { Button, Box, Typography, Stack, TextField } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { LoginRequest } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';

const AdminLoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isAdmin: true,
        username,
        password
      } as LoginRequest)
    })
      .then(async res => {
        const data = await res.json();
        if (data.token) {
          router.push('/admin');
        } else if (data.error === 'INVALID_CREDENTIALS') {
          enqueueSnackbar('אופס, הסיסמה שגויה.', { variant: 'error' });
        } else {
          throw new Error(res.statusText);
        }
      })
      .catch(() => enqueueSnackbar('אופס, החיבור לשרת נכשל.', { variant: 'error' }));
  };

  return (
    <Stack direction="column" spacing={2} component="form" onSubmit={handleSubmit}>
      <Typography variant="h2" textAlign="center">
        התחברות כמנהל:
      </Typography>

      <TextField
        variant="outlined"
        type="username"
        label="שם משתמש"
        value={username}
        onChange={e => setUsername(e.target.value)}
        fullWidth
      />
      <TextField
        fullWidth
        variant="outlined"
        type="password"
        label="סיסמה"
        value={password}
        onChange={e => setPassword(e.target.value)}
        inputProps={{ dir: 'ltr' }}
      />

      <Box justifyContent="flex-end" display="flex" pt={4}>
        <Button endIcon={<ChevronLeftIcon />} type="submit" variant="contained">
          התחבר
        </Button>
      </Box>
    </Stack>
  );
};

export default AdminLoginForm;
