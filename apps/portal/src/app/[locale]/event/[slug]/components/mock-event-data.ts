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
  seasonSlug: 'masterpiece',
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
    {
      id: '1',
      number: 1690,
      name: 'Orbit',
      affiliation: { name: 'High School', city: 'Tel Aviv' }
    },
    {
      id: '2',
      number: 3339,
      name: 'BumbleB',
      affiliation: { name: 'Middle School', city: 'Jerusalem' }
    },
    {
      id: '3',
      number: 4590,
      name: 'GreenBlitz',
      affiliation: { name: 'High School', city: 'Haifa' }
    },
    {
      id: '4',
      number: 1577,
      name: 'Steampunk',
      affiliation: { name: 'High School', city: 'Ramat Gan' }
    },
    {
      id: '5',
      number: 6230,
      name: 'Team Phoenix',
      affiliation: { name: 'Middle School', city: 'Netanya' }
    }
  ],
  div2: [
    {
      id: '6',
      number: 4744,
      name: 'Ninjas',
      affiliation: { name: 'Elementary School', city: 'Beer Sheva' }
    },
    {
      id: '7',
      number: 8223,
      name: 'Tech Tigers',
      affiliation: { name: 'High School', city: 'Herzliya' }
    },
    {
      id: '8',
      number: 5987,
      name: 'Robo Warriors',
      affiliation: { name: 'Middle School', city: 'Ashdod' }
    }
  ],
  div3: [
    {
      id: '9',
      number: 7456,
      name: 'Code Breakers',
      affiliation: { name: 'High School', city: 'Eilat' }
    },
    {
      id: '10',
      number: 2341,
      name: 'Future Builders',
      affiliation: { name: 'Elementary School', city: 'Nazareth' }
    },
    {
      id: '11',
      number: 9876,
      name: 'Innovation Squad',
      affiliation: { name: 'Middle School', city: 'Kfar Saba' }
    }
  ]
};

export const getEventData = (slug: string): EventData => {
  if (slug === mockEventData.slug) {
    return mockEventData;
  }

  throw new Error('Event not found');
};

export const getDivisionData = (slug: string, divisionId: string): DivisionData => {
  const eventData = getEventData(slug);
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

export const getAllTeamsForEvent = (slug: string): Team[] => {
  const eventData = getEventData(slug);
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

// Mock data for scoreboard
export const mockScoreboardData = [
  {
    team: {
      id: '1',
      number: 1690,
      name: 'Orbit',
      affiliation: { name: 'High School', city: 'Tel Aviv' }
    },
    scores: [245, 280, 315],
    maxScore: 315
  },
  {
    team: {
      id: '2',
      number: 3339,
      name: 'BumbleB',
      affiliation: { name: 'Middle School', city: 'Jerusalem' }
    },
    scores: [220, 290, 305],
    maxScore: 305
  },
  {
    team: {
      id: '3',
      number: 4590,
      name: 'GreenBlitz',
      affiliation: { name: 'High School', city: 'Haifa' }
    },
    scores: [195, 275, 295],
    maxScore: 295
  },
  {
    team: {
      id: '4',
      number: 1577,
      name: 'Steampunk',
      affiliation: { name: 'High School', city: 'Ramat Gan' }
    },
    scores: [180, 260, 285],
    maxScore: 285
  },
  {
    team: {
      id: '5',
      number: 6230,
      name: 'Team Phoenix',
      affiliation: { name: 'Middle School', city: 'Netanya' }
    },
    scores: [165, 245, 270],
    maxScore: 270
  }
];

// Mock data for field schedule
export const mockFieldScheduleData = [
  {
    stage: 'Practice',
    number: 1,
    matches: [
      {
        number: 1,
        time: '2024-02-16T09:00:00Z',
        teams: {
          table1: { number: 1690, name: 'Orbit' },
          table2: { number: 3339, name: 'BumbleB' },
          table3: { number: 4590, name: 'GreenBlitz' },
          table4: { number: 1577, name: 'Steampunk' },
          table5: { number: 6230, name: 'Team Phoenix' },
          table6: { number: 4744, name: 'Ninjas' },
          table7: { number: 8223, name: 'Tech Tigers' },
          table8: { number: 5987, name: 'Robo Warriors' }
        }
      },
      {
        number: 2,
        time: '2024-02-16T09:15:00Z',
        teams: {
          table1: { number: 7456, name: 'Code Breakers' },
          table2: { number: 2341, name: 'Future Builders' },
          table3: { number: 9876, name: 'Innovation Squad' },
          table4: { number: 1234, name: 'Cyber Wolves' },
          table5: { number: 5678, name: 'Digital Dragons' },
          table6: { number: 3456, name: 'Robo Rangers' },
          table7: { number: 7890, name: 'Tech Titans' },
          table8: { number: 2468, name: 'Code Warriors' }
        }
      },
      {
        number: 3,
        time: '2024-02-16T09:30:00Z',
        teams: {
          table1: { number: 1357, name: 'Binary Bots' },
          table2: { number: 9753, name: 'Pixel Pirates' },
          table3: { number: 8642, name: 'Logic Lions' },
          table4: { number: 1590, name: 'Quantum Quests' },
          table5: { number: 7531, name: 'Cyber Sharks' },
          table6: { number: 4826, name: 'Data Dolphins' },
          table7: { number: 3691, name: 'Robo Eagles' },
          table8: { number: 5284, name: 'Tech Panthers' }
        }
      }
    ]
  },
  {
    stage: 'Qualification',
    number: 1,
    matches: [
      {
        number: 1,
        time: '2024-02-16T10:00:00Z',
        teams: {
          table1: { number: 1690, name: 'Orbit' },
          table2: { number: 4744, name: 'Ninjas' },
          table3: { number: 7456, name: 'Code Breakers' },
          table4: { number: 3339, name: 'BumbleB' },
          table5: { number: 1577, name: 'Steampunk' },
          table6: { number: 8223, name: 'Tech Tigers' },
          table7: { number: 4590, name: 'GreenBlitz' },
          table8: { number: 6230, name: 'Team Phoenix' }
        }
      },
      {
        number: 2,
        time: '2024-02-16T10:15:00Z',
        teams: {
          table1: { number: 5987, name: 'Robo Warriors' },
          table2: { number: 2341, name: 'Future Builders' },
          table3: { number: 9876, name: 'Innovation Squad' },
          table4: { number: 1234, name: 'Cyber Wolves' },
          table5: { number: 5678, name: 'Digital Dragons' },
          table6: { number: 3456, name: 'Robo Rangers' },
          table7: { number: 7890, name: 'Tech Titans' },
          table8: { number: 2468, name: 'Code Warriors' }
        }
      },
      {
        number: 3,
        time: '2024-02-16T10:30:00Z',
        teams: {
          table1: { number: 1357, name: 'Binary Bots' },
          table2: { number: 9753, name: 'Pixel Pirates' },
          table3: { number: 8642, name: 'Logic Lions' },
          table4: { number: 1590, name: 'Quantum Quests' },
          table5: { number: 7531, name: 'Cyber Sharks' },
          table6: { number: 4826, name: 'Data Dolphins' },
          table7: { number: 3691, name: 'Robo Eagles' },
          table8: { number: 5284, name: 'Tech Panthers' }
        }
      }
    ]
  }
];

// Mock data for judging schedule
export const mockJudgingScheduleData = [
  {
    startTime: '2024-02-16T11:00:00Z',
    endTime: '2024-02-16T11:20:00Z',
    teams: {
      room1: { number: 1690, name: 'Orbit' },
      room2: { number: 3339, name: 'BumbleB' },
      room3: { number: 4590, name: 'GreenBlitz' },
      room4: { number: 1577, name: 'Steampunk' }
    }
  },
  {
    startTime: '2024-02-16T12:00:00Z',
    endTime: '2024-02-16T12:30:00Z',
    teams: {
      room1: { number: 6230, name: 'Team Phoenix' },
      room2: { number: 4744, name: 'Ninjas' },
      room3: { number: 8223, name: 'Tech Tigers' },
      room4: { number: 5987, name: 'Robo Warriors' }
    }
  },
  {
    startTime: '2024-02-16T13:00:00Z',
    endTime: '2024-02-16T13:25:00Z',
    teams: {
      room1: { number: 7456, name: 'Code Breakers' },
      room2: { number: 2341, name: 'Future Builders' },
      room3: { number: 9876, name: 'Innovation Squad' },
      room4: null
    }
  }
];

// Mock data for awards
export const mockAwardsData = [
  // Championship Awards
  {
    id: '1',
    name: 'פרס מתנדב/ת השנה',
    place: 1,
    winner: 'שחר יהלום',
    category: 'personal' as const
  },

  // Excellence Awards
  {
    id: '2',
    name: 'פרס המנטור המצטיין',
    place: 1,
    winner: { id: '6', number: 841, name: 'יובל כדורי' },
    category: 'team' as const
  },

  // Championship Awards
  {
    id: '3',
    name: 'פרס האליפות',
    place: 1,
    winner: { id: '7', number: 2864, name: 'Black Spiders' },
    category: 'team' as const
  },
  {
    id: '4',
    name: 'פרס האליפות',
    place: 2,
    winner: { id: '8', number: 3388, name: 'גיימרות' },
    category: 'team' as const
  },
  {
    id: '5',
    name: 'פרס האליפות',
    place: 3,
    winner: { id: '9', number: 515, name: 'Pegasus' },
    category: 'team' as const
  },

  // Innovation Awards
  {
    id: '6',
    name: 'פרס ההשפעה',
    place: 1,
    winner: { id: '10', number: 1543, name: 'Robofeel' },
    category: 'team' as const
  },

  // Judges Awards
  {
    id: '7',
    name: 'פרס השופטים',
    place: 1,
    winner: { id: '11', number: 3345, name: 'רובוטריקות' },
    category: 'team' as const
  },
  {
    id: '8',
    name: 'פרס השופטים',
    place: 2,
    winner: { id: '12', number: 3396, name: 'Castle Knights' },
    category: 'team' as const
  },
  {
    id: '9',
    name: 'פרס השופטים',
    place: 3,
    winner: { id: '13', number: 1297, name: 'Future Programmers' },
    category: 'team' as const
  },

  // Robot Performance Awards
  {
    id: '10',
    name: 'פרס ביצועי הרובוט',
    place: 1,
    winner: { id: '8', number: 3388, name: 'גיימרות' },
    category: 'team' as const
  },
  {
    id: '11',
    name: 'פרס ביצועי הרובוט',
    place: 2,
    winner: { id: '14', number: 285, name: 'D++' },
    category: 'team' as const
  }
];
