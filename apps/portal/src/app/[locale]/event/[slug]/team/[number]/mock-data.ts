import { Team, DivisionData } from '@lems/types/api/portal';

export interface TeamInEventData {
  team: Team;
  division: DivisionData;
  eventName: string;
  eventSlug: string;
}

export const mockTeamInEventData: TeamInEventData = {
  team: {
    id: '1',
    name: 'Orbit',
    number: 1690,
    logoUrl: null,
    affiliation: 'Ort Kiryat Bialik',
    city: 'Kiryat Bialik',
    coordinates: null
  },
  division: {
    id: 'div1',
    name: 'Division A',
    color: '#1976d2',
    teams: [],
    awards: [
      {
        id: 'award1',
        name: 'Robot Performance Award',
        type: 'TEAM',
        place: 1,
        winner: '1690'
      },
      {
        id: 'award2',
        name: 'Innovation Project Award',
        type: 'TEAM',
        place: 2,
        winner: '1690'
      }
    ],
    fieldSchedule: [
      {
        id: 'match1',
        round: 1,
        number: 1,
        stage: 'Practice',
        scheduledTime: new Date('2024-01-15T09:00:00'),
        participants: [
          { teamId: '1', tableId: 'table1' }
        ]
      },
      {
        id: 'match2',
        round: 1,
        number: 5,
        stage: 'Ranking',
        scheduledTime: new Date('2024-01-15T10:30:00'),
        participants: [
          { teamId: '1', tableId: 'table2' }
        ]
      },
      {
        id: 'match3',
        round: 1,
        number: 6,
        stage: 'Ranking',
        scheduledTime: new Date('2024-01-15T10:30:00'),
        participants: [
          { teamId: '1', tableId: 'table3' }
        ]
      },
      {
        id: 'match4',
        round: 1,
        number: 7,
        stage: 'Ranking',
        scheduledTime: new Date('2024-01-15T10:30:00'),
        participants: [
          { teamId: '1', tableId: 'table4' }
        ]
      },
    ],
    judgingSchedule: [
      {
        id: 'judging1',
        number: 1,
        teamId: '1',
        roomId: 'room1',
        scheduledTime: new Date('2024-01-15T11:00:00')
      }
    ],
    rooms: [
      { id: 'room1', name: 'Room A' }
    ],
    tables: [
      { id: 'table1', name: 'Table 1' },
      { id: 'table2', name: 'Table 2' },
      { id: 'table3', name: 'Table 3' },
      { id: 'table4', name: 'Table 4' },
      { id: 'table5', name: 'Table 5' },
      { id: 'table6', name: 'Table 6' },
      { id: 'table7', name: 'Table 7' },
    ],
    scoreboard: [
      {
        teamId: '1',
        robotGameRank: 1,
        maxScore: 285,
        scores: [245, 260, 285, 270]
      }
    ]
  },
  eventName: 'Israel Regional #1',
  eventSlug: 'israel-regional-1'
};
