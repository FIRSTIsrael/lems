import {
  AppBar,
  Box,
  Breakpoint,
  Container,
  IconButton,
  Toolbar,
  Typography,
  keyframes
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NextLink from 'next/link';

interface Props {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: Breakpoint | number;
  back?: string;
  backDisabled?: boolean;
  action?: React.ReactNode;
  error?: boolean;
}

const errorAnimation = keyframes`
  from { background: #fecaca; }
  to { background: #fca5a5; }
`;

const Layout: React.FC<Props> = ({
  title,
  back,
  backDisabled,
  children,
  maxWidth = 'lg',
  action,
  error
}) => {
  return (
    <>
      {title && (
        <>
          <AppBar
            position="fixed"
            sx={{
              animation: error ? `${errorAnimation} 1s linear infinite alternate` : undefined
            }}
          >
            <Toolbar sx={{ px: { xs: 2, md: 3, lg: 4 } }}>
              {back && (
                <NextLink href={back} passHref>
                  <IconButton
                    edge="start"
                    color="inherit"
                    disabled={backDisabled}
                    aria-label="אחורה"
                    sx={{ mr: 2 }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </NextLink>
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
            </Toolbar>
          </AppBar>
          <Box sx={{ height: theme => theme.mixins.toolbar.minHeight }} />
        </>
      )}
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
              אירעה שגיאה בלתי צפויה, אנא פנו לשופט הראשי.
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Layout;
