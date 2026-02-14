'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { lighten, Typography, Stack, Box, useTheme } from '@mui/material';
import { buildNavigationItems } from '../../../../lib/navigation-items';
import { useUser } from '../../../components/user-context';

interface NavigationListProps {
  onItemClick?: () => void;
}

export const NavigationList: React.FC<NavigationListProps> = ({ onItemClick }) => {
  const t = useTranslations('components.navigation-list');

  const pathname = usePathname();
  const theme = useTheme();
  const user = useUser();

  const items = buildNavigationItems(user, pathname);

  return (
    <Stack mt={2} spacing={4} alignItems="center">
      {items.map(item => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onItemClick}
          style={{ textDecoration: 'none' }}
        >
          <Box
            sx={{
              cursor: 'pointer',
              '&:hover': {
                '& .navigation-icon': {
                  bgcolor: lighten(theme.palette.primary.main, 0.7),
                  color: 'text.primary',
                  transform: 'translateY(-4px)',
                  boxShadow: item.active ? theme.shadows[6] : theme.shadows[1]
                },
                '& .navigation-text': { color: 'text.primary', fontWeight: 700 }
              }
            }}
          >
            <Box
              className="navigation-icon"
              borderRadius={8}
              p={2}
              bgcolor={item.active ? lighten(theme.palette.primary.main, 0.8) : 'none'}
              width={70}
              height={40}
              key={item.label}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={item.active ? 'primary.main' : 'text.secondary'}
              sx={{
                transition:
                  'background-color 0.25s, color 0.15s, box-shadow 0.15s, transform 0.15s',
                boxShadow: item.active ? theme.shadows[3] : 'none',
                transform: 'translateY(0)'
              }}
            >
              {item.icon}
            </Box>
            <Typography
              className="navigation-text"
              color={item.active ? theme.palette.primary.main : 'text.secondary'}
              mt={1}
              align="center"
              variant="body2"
              fontWeight={item.active ? 700 : 600}
              sx={{ transition: 'color 0.15s, font-weight 0.15s' }}
            >
              {t(item.label)}
            </Typography>
          </Box>
        </Link>
      ))}
    </Stack>
  );
};
