import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import {
  Button,
  Box,
  Typography,
  Stack,
  TextField,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Layout from '../../components/layout';
import { apiFetch } from '../../lib/utils/fetch';
import { useRecaptcha } from '../../hooks/use-recaptcha';

interface PageProps {
  recaptchaRequired: boolean;
}

const Page: NextPage<PageProps> = ({ recaptchaRequired }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const removeBadge = useRecaptcha(recaptchaRequired);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      enqueueSnackbar('אנא מלא את כל השדות הנדרשים', { variant: 'warning' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/admin/login', {});

      const data = await response.json();

      if (data && !data.error) {
        const returnUrl = router.query.returnUrl || '/admin';
        router.push(returnUrl as string);
      } else if (data.error) {
        // TODO: Handle specific error messages
      } else {
        // TODO: Error message
        enqueueSnackbar('אופס, משהו השתבש', { variant: 'error' });
      }
    } catch {
      // TODO: Handle server connection errors
      enqueueSnackbar('אופס, החיבור לשרת נכשל', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Stack direction="column" spacing={3} component="form" onSubmit={handleSubmit}>
          <Typography variant="h2" textAlign="center" sx={{ mb: 2 }}>
            התחברות למערכת
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="שם משתמש"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
            required
          />

          <TextField
            fullWidth
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            label="סיסמה"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <Box sx={{ pt: 2 }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !username.trim() || !password.trim()}
              endIcon={<ChevronLeftIcon />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem'
              }}
              loading={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  // TODO: Redirect if already logged in

  const recaptchaRequired = process.env.RECAPTCHA === 'true';
  return { props: { recaptchaRequired } };
};

export default Page;
