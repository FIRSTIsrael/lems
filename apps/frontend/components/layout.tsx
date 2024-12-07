import { useRouter } from 'next/router';
import { useState, CSSProperties } from 'react';
import {
  AppBar,
  Box,
  Breakpoint,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import { apiFetch } from '../lib/utils/fetch';
import { errorAnimation } from '../lib/utils/animations';

interface LayoutProps {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: Breakpoint | number;
  back?: string;
  backDisabled?: boolean;
  action?: React.ReactNode;
  error?: boolean;
  color?: CSSProperties['color'];
}

const Layout: React.FC<LayoutProps> = ({
  title,
  back,
  backDisabled,
  children,
  maxWidth = 'lg',
  action,
  error,
  color
}) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const handleBack = () => {
    const queryString = router.query.divisionId
      ? new URLSearchParams({ divisionId: router.query.divisionId as string }).toString()
      : '';
    const url = `${back}${queryString ? `?${queryString}` : ''}`;
    router.push(url);
  };

  const logout = () => {
    apiFetch('/auth/logout', { method: 'POST' }).then(res => router.push('/'));
  };

  return (
    <>
      {title && (
        <>
          <AppBar
            position="fixed"
            sx={{
              animation: error ? `${errorAnimation} 1s linear infinite alternate` : undefined,
              borderBottom: color && `5px solid ${color}`
            }}
          >
            <Toolbar>
              {back && (
                <IconButton
                  edge="start"
                  color="inherit"
                  disabled={backDisabled}
                  aria-label="אחורה"
                  sx={{ mr: 2 }}
                  onClick={handleBack}
                >
                  <ChevronRightIcon />
                </IconButton>
              )}

              <Typography
                variant="h1"
                component="div"
                fontSize="1.125rem"
                fontWeight={500}
                sx={{ flexGrow: 1 }}
              >
                {error && 'שגיאה - '}
                {title}
              </Typography>

              {action}
              <Tooltip title="התנתק" arrow>
                <IconButton onClick={() => setOpen(true)} sx={{ ml: 2 }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Box sx={{ height: theme => theme.mixins.toolbar.minHeight }} />
        </>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="logout-title"
        aria-describedby="logout-description"
      >
        <DialogTitle id="logout-title">התנתקות</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-description">
            האם אתם בטוחים שברצונכם להתנתק?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={logout} autoFocus>
            אישור
          </Button>
        </DialogActions>
      </Dialog>
      <Container
        maxWidth={isNaN(maxWidth as number) ? (maxWidth as Breakpoint) : undefined}
        sx={{
          flex: 1,
          maxWidth: isNaN(maxWidth as number) ? undefined : `${maxWidth}px !important`
        }}
      >
        {children}
        {error && (
          <>
            <Box height={24} />
            <Box
              sx={{
                backgroundColor: '#facc15',
                color: '#000',
                border: '4px solid #000',
                p: 2,
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                zIndex: 1500,
                position: 'sticky',
                bottom: '2rem',
                right: '12%',
                left: '12%',
                borderRadius: 4
              }}
            >
              שגיאה בלתי צפויה, אנא פנו למנהל המערכת.
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Layout;
