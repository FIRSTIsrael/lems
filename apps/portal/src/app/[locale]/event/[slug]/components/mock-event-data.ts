// Mock data for event pages

export interface EventData {
  id: string;
  name: string;
  slug: string;
  seasonName: string;
  seasonSlug: string;
  startDate: Date;
  endDate: Date;
  location: string;
  coordinates?: string;
  divisions: Division[];
}

export interface Division {
  id: string;
  name: string;
  color: string;
  teamCount: number;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: {
    name: string;
    city: string;
  };
  division?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface DivisionData extends EventData {
  currentDivision: Division;
  teams: Team[];
}

// Mock event data
export const mockEventData: EventData = {
  id: '1',
  name: 'Israel Regional Championship',
  slug: 'israel-regional-championship',
  seasonName: 'MASTERPIECE 2023-2024',
  seasonSlug: 'masterpiece-2023-2024',
  startDate: new Date('2024-02-16'),
  endDate: new Date('2024-02-16'),
  location: 'Tel Aviv Convention Center, Tel Aviv',
  coordinates: '32.0853,34.7818',
  divisions: [
    { id: 'div1', name: 'Einstein Division', color: '#9c27b0', teamCount: 24 },
    { id: 'div2', name: 'Newton Division', color: '#2196f3', teamCount: 22 },
    { id: 'div3', name: 'Curie Division', color: '#4caf50', teamCount: 25 }
  ]
};

// Mock teams data by division
export const mockTeamsData: Record<string, Team[]> = {
  div1: [
    { id: '1', number: 1690, name: 'Orbit', affiliation: { name: 'High School', city: 'Tel Aviv' } },
    { id: '2', number: 3339, name: 'BumbleB', affiliation: { name: 'Middle School', city: 'Jerusalem' } },
    { id: '3', number: 4590, name: 'GreenBlitz', affiliation: { name: 'High School', city: 'Haifa' } },
    { id: '4', number: 1577, name: 'Steampunk', affiliation: { name: 'High School', city: 'Ramat Gan' } },
    { id: '5', number: 6230, name: 'Team Phoenix', affiliation: { name: 'Middle School', city: 'Netanya' } }
  ],
  div2: [
    { id: '6', number: 4744, name: 'Ninjas', affiliation: { name: 'Elementary School', city: 'Beer Sheva' } },
    { id: '7', number: 8223, name: 'Tech Tigers', affiliation: { name: 'High School', city: 'Herzliya' } },
    { id: '8', number: 5987, name: 'Robo Warriors', affiliation: { name: 'Middle School', city: 'Ashdod' } }
  ],
  div3: [
    { id: '9', number: 7456, name: 'Code Breakers', affiliation: { name: 'High School', city: 'Eilat' } },
    { id: '10', number: 2341, name: 'Future Builders', affiliation: { name: 'Elementary School', city: 'Nazareth' } },
    { id: '11', number: 9876, name: 'Innovation Squad', affiliation: { name: 'Middle School', city: 'Kfar Saba' } }
  ]
};

export const getEventData = async (slug: string): Promise<EventData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (slug === mockEventData.slug) {
    return mockEventData;
  }
  
  throw new Error('Event not found');
};

export const getDivisionData = async (slug: string, divisionId: string): Promise<DivisionData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const eventData = await getEventData(slug);
  const division = eventData.divisions.find(d => d.id === divisionId);
  
  if (!division) {
    throw new Error('Division not found');
  }
  
  const teams = mockTeamsData[divisionId] || [];
  
  return {
    ...eventData,
    currentDivision: division,
    teams
  };
};

export const getAllDivisions = (): Division[] => {
  return mockEventData.divisions;
};

export const getTotalTeamCount = (): number => {
  return mockEventData.divisions.reduce((sum, div) => sum + div.teamCount, 0);
};

export const getAllTeamsForEvent = async (slug: string): Promise<Team[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const eventData = await getEventData(slug);
  const allTeams: Team[] = [];
  
  // Collect teams from all divisions
  for (const division of eventData.divisions) {
    const divisionTeams = mockTeamsData[division.id] || [];
    const teamsWithDivision = divisionTeams.map(team => ({
      ...team,
      division: {
        id: division.id,
        name: division.name,
        color: division.color
      }
    }));
    allTeams.push(...teamsWithDivision);
  }
  
  return allTeams;
};
