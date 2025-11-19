import { LemsUser } from '@lems/types/api/lems';
import { AutoGraph, DashboardRounded, Description } from '@mui/icons-material';

export const buildNavigationItems = (user: LemsUser, url: string) => {
  const items = [
    {
      label: 'dashboard',
      icon: <DashboardRounded />,
      href: `/lems/${user.role}`,
      active: url.startsWith(`/lems/${user.role}`)
    }
  ];

  if (user.role !== 'reports') {
    items.push({
      label: 'reports',
      icon: <Description />,
      href: `/lems/reports`,
      active: url.startsWith(`/lems/reports`)
    });
  }

  // TODO: Future: Allow insights for some users.
  // eslint-disable-next-line no-constant-condition
  if (false) {
    items.push({
      label: 'insights',
      icon: <AutoGraph />,
      href: `/lems/insights`,
      active: url.startsWith(`/lems/insights`)
    });
  }

  return items;
};
