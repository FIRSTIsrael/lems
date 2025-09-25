import {
  Calculate as CalculatorIcon,
  Event as EventIcon,
  Storage as GitHubIcon,
  Map as MapIcon
} from '@mui/icons-material';

export const mockEvents = [
  // Active Events
  {
    id: '1',
    name: 'Regional Championship 2025',
    date: '2025-03-15',
    location: 'Tel Aviv Convention Center',
    teamsRegistered: 24,
    status: 'registration-open',
    isActive: true
  },
  {
    id: '2',
    name: 'Jerusalem District Tournament',
    date: '2025-03-22',
    location: 'Jerusalem Technology Park',
    teamsRegistered: 16,
    status: 'registration-open',
    isActive: true
  },

  // Upcoming Events
  {
    id: '3',
    name: 'Northern District Qualifier',
    date: '2025-04-12',
    location: 'Haifa Tech Center',
    teamsRegistered: 18,
    status: 'registration-open',
    isActive: false,
    isUpcoming: true
  },
  {
    id: '4',
    name: 'Southern Regional Competition',
    date: '2025-04-26',
    location: "Be'er Sheva Innovation Center",
    teamsRegistered: 22,
    status: 'registration-open',
    isActive: false,
    isUpcoming: true
  },
  {
    id: '5',
    name: 'National Championship 2025',
    date: '2025-05-15',
    location: 'Tel Aviv Expo Center',
    teamsRegistered: 0,
    status: 'registration-closed',
    isActive: false,
    isUpcoming: true
  },

  // Past Events
  {
    id: '6',
    name: 'Central District Kickoff',
    date: '2025-01-18',
    location: 'Rishon LeZion Community Center',
    teamsRegistered: 20,
    status: 'completed',
    isActive: false,
    isPast: true
  },
  {
    id: '7',
    name: 'Coastal Regional Qualifier',
    date: '2025-02-08',
    location: 'Netanya Sports Complex',
    teamsRegistered: 14,
    status: 'completed',
    isActive: false,
    isPast: true
  },
  {
    id: '8',
    name: 'Winter Practice Tournament',
    date: '2024-12-15',
    location: 'Herzliya High-Tech Center',
    teamsRegistered: 12,
    status: 'completed',
    isActive: false,
    isPast: true
  }
];

export const quickActions = [
  {
    title: 'robot-scorer',
    description: 'robot-scorer-description',
    icon: CalculatorIcon,
    href: '/scorer',
    color: 'primary' as const
  },
  {
    title: 'browse-events',
    description: 'browse-events-description',
    icon: EventIcon,
    href: '/events',
    color: 'primary' as const
  }
];

export const resourceLinks = [
  {
    title: 'fll-website',
    description: 'fll-website-description',
    icon: MapIcon,
    href: 'https://firstisrael.org.il/fll/challenge',
    color: 'primary' as const,
    external: true
  },
  {
    title: 'github',
    description: 'github-description',
    icon: GitHubIcon,
    href: 'https://github.com/FIRSTIsrael/lems',
    color: 'primary' as const,
    external: true
  }
];
