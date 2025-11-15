import { Stack, Box, alpha, Typography, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';

const ITEMS = [
  { label: 'Dashboard', href: '#', icon: <Search />, active: true },
  { label: 'Teams', href: '#', icon: <Search /> },
  { label: 'Matches', href: '#', icon: <Search /> },
  { label: 'Rankings', href: '#', icon: <Search /> }
];

interface NavigationListProps {
  onItemClick?: () => void;
}

export const NavigationList: React.FC<NavigationListProps> = ({ onItemClick }) => {
  const theme = useTheme();

  return (
    <Stack spacing={1} sx={{ p: 2, flexGrow: 1 }}>
      {ITEMS.map(item => (
        <Box
          key={item.label}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            bgcolor: item.active ? alpha(theme.palette.primary.main, 0.12) : 'none',
            boxShadow: item.active ? theme.shadows[2] : 'none',
            transition: 'all 0.2s ease-in-out',
            borderRadius: 2,
            py: 1.5,
            px: 2,
            border: item.active
              ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              boxShadow: theme.shadows[3],
              transform: 'translateY(-2px)',
              '& .navigation-icon': {
                color: 'text.primary'
              }
            }
          }}
          onClick={onItemClick}
        >
          <Box
            className="navigation-icon"
            color={item.active ? 'primary' : 'text.secondary'}
            sx={{
              transition: 'color 0.15s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {item.icon}
          </Box>
          <Typography
            className="navigation-text"
            color={item.active ? 'primary' : 'text.secondary'}
            variant="body2"
            fontWeight={item.active ? 700 : 600}
            sx={{
              transition: 'all 0.15s ease-in-out'
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
