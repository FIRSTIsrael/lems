// Mock team data
export interface Team {
  id: string;
  number: number;
  name: string;
  logoUrl: string | null;
  affiliation: string;
  city: string;
  coordinates: string | null;
  // Additional
  rookieYear?: number;
  lastCompeted?: number;
  website?: string;
  isChampion?: boolean;
  championYear?: number;
  championEvent?: string;
  awards?: string[];
  events?: string[];
  seasons?: number[];
}

export const mockTeams: Team[] = [
  // Team 1690 - Orbit (Champion)
  {
    id: '1690',
    number: 1690,
    name: 'Orbit',
    logoUrl: '/assets/teams/team1690-orbit.svg',
    affiliation: 'Binyamina - Givat Ada Local Council/Ministry of Education',
    city: 'Binyamina',
    coordinates: '32.5213,34.9370',
    rookieYear: 2005,
    lastCompeted: 2025,
    website: 'firstinspires.org',
    isChampion: true,
    championYear: 2024,
    championEvent: 'FIRST Israel District Championship',
    awards: [
      'District Event Winner',
      'Autonomous Award',
      'Engineering Inspiration Award',
      "Chairman's Award",
      'Regional Winner',
      'Innovation in Control Award'
    ],
    events: ['ISR #1', 'ISR #3', 'Israel Championship', 'Johnson Division', 'Einstein Division'],
    seasons: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]
  },

  // Team 3339 - BumbleB (Champion)
  {
    id: '3339',
    number: 3339,
    name: 'BumbleB',
    logoUrl: '/assets/teams/team3339-bumbleb.svg',
    affiliation: 'Tel Aviv Municipality/Intel/Microsoft',
    city: 'Tel Aviv',
    coordinates: '32.0853,34.7818',
    rookieYear: 2010,
    lastCompeted: 2025,
    website: 'bumbleb3339.org',
    isChampion: true,
    championYear: 2023,
    championEvent: 'FIRST Israel Regional Championship',
    awards: [
      'Regional Winner',
      'Excellence in Engineering Award',
      'Robot Design Award',
      'Teamwork Award',
      'Innovation Award'
    ],
    events: ['ISR #2', 'ISR #4', 'Israel Championship', 'World Championship'],
    seasons: [2025, 2024, 2023, 2022, 2021, 2020]
  },

  // Team 1943 - Neat Team
  {
    number: 1943,
    name: 'Neat Team',
    nickname: 'Neat Team',
    location: 'Haifa, Haifa District, Israel',
    city: 'Haifa',
    rookieYear: 2007,
    lastCompeted: 2025,
    website: 'neatteam1943.com',
    socialMedia: {
      facebook: 'neatteam1943',
      youtube: 'neatteam1943',
      instagram: 'neatteam1943'
    },
    isChampion: false,
    awards: ['Regional Finalist', 'Design Award', 'Programming Award', 'Sportsmanship Award']
  },

  // Team 5987 - Galaxia
  {
    number: 5987,
    name: 'Galaxia',
    nickname: 'Galaxia',
    location: 'Jerusalem, Jerusalem District, Israel',
    city: 'Jerusalem',
    rookieYear: 2015,
    lastCompeted: 2025,
    website: 'galaxia5987.org',
    socialMedia: {
      facebook: 'galaxia5987',
      instagram: 'galaxia5987'
    },
    isChampion: false,
    awards: [
      'Rookie All-Star Award',
      'Creativity Award',
      'Team Spirit Award',
      'Community Impact Award'
    ]
  },

  // Team 4590 - GreenBlitz
  {
    id: '4590',
    number: 4590,
    name: 'GreenBlitz',
    logoUrl: null,
    affiliation: 'Bar-Ilan University/Environmental Organizations',
    city: 'Ramat Gan',
    coordinates: '32.0719,34.8244',
    rookieYear: 2013,
    lastCompeted: 2025,
    website: 'greenblitz4590.org',
    isChampion: false,
    awards: ['Environmental Impact Award', 'Sustainability Award', 'Innovation Award'],
    events: ['ISR #2', 'Regional Qualifier', 'Green Innovation Challenge'],
    seasons: [2025, 2024, 2023, 2022]
  },

  // Team 8223 - Mariners
  {
    number: 8223,
    name: 'Mariners',
    nickname: 'Mariners',
    location: 'Ashdod, Southern District, Israel',
    city: 'Ashdod',
    rookieYear: 2020,
    lastCompeted: 2025,
    socialMedia: {
      instagram: 'mariners8223'
    },
    isChampion: false,
    awards: ['Rookie Inspiration Award', 'Teamwork Award']
  },

  // Team 2230 - GeneralAngles
  {
    number: 2230,
    name: 'GeneralAngles',
    nickname: 'GeneralAngles',
    location: 'Petah Tikva, Center District, Israel',
    city: 'Petah Tikva',
    rookieYear: 2008,
    lastCompeted: 2025,
    socialMedia: {
      facebook: 'generalangles2230'
    },
    isChampion: false,
    awards: ['Gracious Professionalism Award', 'Team Spirit Award']
  },

  // Team 1574 - MisCar (Inactive)
  {
    number: 1574,
    name: 'MisCar',
    nickname: 'MisCar',
    location: 'Rishon LeZion, Center District, Israel',
    city: 'Rishon LeZion',
    rookieYear: 2005,
    lastCompeted: 2019,
    socialMedia: {},
    isChampion: false,
    awards: [
      'Regional Winner (2018)',
      'Engineering Excellence Award',
      'Innovation in Control Award'
    ]
  },

  // Team 6738 - Excalibur (Inactive)
  {
    number: 6738,
    name: 'Excalibur',
    nickname: 'Excalibur',
    location: 'Netanya, Center District, Israel',
    city: 'Netanya',
    rookieYear: 2017,
    lastCompeted: 2021,
    socialMedia: {},
    isChampion: false,
    awards: ['Rookie Team Award', 'Design Award']
  }
];

export const getChampionTeams = (teams: Team[] = mockTeams): Team[] => {
  return teams.filter(team => team.isChampion);
};

export const getTeamByNumber = (
  teamNumber: number,
  teams: Team[] = mockTeams
): Team | undefined => {
  return teams.find(team => team.number === teamNumber);
};

export const searchTeams = (teams: Team[], query: string): Team[] => {
  const searchTerm = query.toLowerCase();
  return teams.filter(
    team =>
      team.number.toString().includes(searchTerm) ||
      team.name.toLowerCase().includes(searchTerm) ||
      team.nickname.toLowerCase().includes(searchTerm) ||
      team.city.toLowerCase().includes(searchTerm) ||
      team.location.toLowerCase().includes(searchTerm)
  );
};

export const getTeamCounts = (teams: Team[] = mockTeams) => {
  return {
    all: teams.length,
    champions: getChampionTeams(teams).length
  };
};
