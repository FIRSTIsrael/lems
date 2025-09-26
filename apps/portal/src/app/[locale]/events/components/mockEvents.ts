import { Event } from '../../components/homepage/EventCard';

// Mock data - in real app this would come from API
export const mockEvents: Event[] = [
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
    isUpcoming: true
  },
  {
    id: '4',
    name: 'Southern Regional',
    date: '2025-04-19',
    location: "Be'er Sheva Innovation Center",
    teamsRegistered: 20,
    status: 'registration-open',
    isUpcoming: true
  },
  {
    id: '5',
    name: 'Central District Championship',
    date: '2025-05-03',
    location: 'Rishon LeZion Sports Complex',
    teamsRegistered: 22,
    status: 'registration-open',
    isUpcoming: true
  },
  // Past Events
  {
    id: '6',
    name: 'Practice Tournament 2024',
    date: '2024-12-15',
    location: 'Tel Aviv University',
    teamsRegistered: 12,
    status: 'completed',
    isPast: true
  },
  {
    id: '7',
    name: 'Kickoff Event 2024',
    date: '2024-11-20',
    location: 'Technion - Haifa',
    teamsRegistered: 30,
    status: 'completed',
    isPast: true
  }
];

// Helper functions for filtering events
export const getActiveEvents = (events: Event[] = mockEvents) =>
  events.filter(event => event.isActive);

export const getUpcomingEvents = (events: Event[] = mockEvents) =>
  events.filter(event => event.isUpcoming);

export const getPastEvents = (events: Event[] = mockEvents) => events.filter(event => event.isPast);

export const getEventCounts = (events: Event[] = mockEvents) => ({
  all: events.length,
  active: getActiveEvents(events).length,
  upcoming: getUpcomingEvents(events).length,
  past: getPastEvents(events).length
});
