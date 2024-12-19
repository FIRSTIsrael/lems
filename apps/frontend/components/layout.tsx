import { useRouter } from 'next/router';
import { useState, CSSProperties } from 'react';
import { WithId } from 'mongodb';
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
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import { apiFetch } from '../lib/utils/fetch';
import { errorAnimation } from '../lib/utils/animations';
import {
  DivisionWithEvent,
  DivisionState,
  SafeUser,
  EventUserAllowedRoles,
  ReportsAllowedRoleTypes,
  ReportsAllowedRoles,
  InsightsAllowedRoleTypes,
  InsightsAllowedRoles,
  ConnectionStatus
} from '@lems/types';
import ConnectionIndicator from './connection-indicator';
import DivisionDropdown from './general/division-dropdown';
import ReportLink from './general/report-link';
import InsightsLink from './general/insights-link';

interface LayoutProps {
  user?: WithId<SafeUser>;
  division?: WithId<DivisionWithEvent>;
  divisionState?: WithId<DivisionState>;
  connectionStatus?: ConnectionStatus;
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
  user,
  division,
  divisionState,
  connectionStatus,
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

  const isError = error || connectionStatus === 'disconnected';
  const isEventUser =
    (division?.event && user?.isAdmin) ||
    division?.event?.eventUsers.includes(user?.role as EventUserAllowedRoles);
  const showReports =
    user?.isAdmin || ReportsAllowedRoleTypes.includes(user?.role as ReportsAllowedRoles);
  const showInsights =
    (divisionState?.completed && user?.isAdmin) ||
    InsightsAllowedRoleTypes.includes(user?.role as InsightsAllowedRoles);

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
              animation: isError ? `${errorAnimation} 1s linear infinite alternate` : undefined,
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
                {isError && 'שגיאה - '}
                {title}
              </Typography>

              <Stack direction="row" spacing={2}>
                {isEventUser && (
                  // isEventUser should be false if division?.event is undefined
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  <DivisionDropdown event={division!.event} selected={division!._id.toString()} />
                )}
                {showInsights && <InsightsLink />}
                {showReports && <ReportLink />}
                {connectionStatus && <ConnectionIndicator status={connectionStatus} />}
                {action}
              </Stack>

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
        {isError && (
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
