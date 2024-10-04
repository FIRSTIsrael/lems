import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Team, Scoresheet, JudgingSession, JudgingRoom, CoreValuesForm } from '@lems/types';
import { cvFormSchema } from '@lems/season';

interface TeamWithRanks extends Team {
  cvRank: number;
  ipRank: number;
  rdRank: number;
  rgRank: number;
  totalRank: number;
}

interface ChampionsDeliberationGridProps {
  teams: Array<WithId<TeamWithRanks>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  scoresheets: Array<WithId<Scoresheet>>;
  disabled?: boolean;
}

const ChampionsDeliberationsGrid: React.FC<ChampionsDeliberationGridProps> = ({
  teams,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  disabled = false
}) => {
  const rankingRounds = [
    ...new Set(scoresheets.filter(s => s.stage === 'ranking').flatMap(s => s.round))
  ];

  const rows = teams.map(team => {
    const roomId = sessions.find(
      session => session.teamId?.toString() === team._id.toString()
    )?.roomId;
    const roomName = rooms.find(room => room._id.toString() === roomId?.toString())?.name;
    const cvFormSeverities = cvForms
      .filter(cvform => cvform.demonstratorAffiliation === team?.number.toString())
      .map(cvForm => cvForm.severity);
    const maxScore = Math.max(
      ...scoresheets
        .filter(s => s.teamId === team._id && s.stage === 'ranking')
        .map(s => s.data?.score ?? 0)
    );

    const gp: { [key: string]: number } = {};
    scoresheets
      .filter(scoresheet => scoresheet.teamId === team._id && scoresheet.stage === 'ranking')
      .forEach(scoresheet => (gp[`gp-${scoresheet.round}`] = scoresheet.data?.gp?.value || 3));

    return {
      id: team._id,
      team,
      room: roomName,
      totalRank: team.totalRank,
      cvRank: team.cvRank,
      ipRank: team.ipRank,
      rdRank: team.rdRank,
      rgRank: team.rgRank,
      maxScore,
      cvFormSeverities,
      ...gp
    };
  });

  const defaultColumnSettings: Partial<GridColDef<(typeof rows)[number]>> = {
    type: 'number',
    width: 60,
    headerAlign: 'center',
    align: 'center'
  };
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'teamNumber',
      headerName: 'מספר קבוצה',
      type: 'string',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value, row) => row.team?.number
    },
    {
      field: 'room',
      headerName: 'חדר',
      type: 'string',
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'totalRank',
      headerName: 'דירוג',
      cellClassName: 'total-cell',
      ...defaultColumnSettings
    },
    {
      field: 'cvRank',
      headerName: 'ערכי ליבה',
      ...defaultColumnSettings
    },
    {
      field: 'ipRank',
      headerName: 'פרויקט החדשנות',
      ...defaultColumnSettings
    },
    {
      field: 'rdRank',
      headerName: 'תכנון הרובוט',
      ...defaultColumnSettings
    },
    {
      field: 'rgRank',
      headerName: 'משחק הרובוט',
      ...defaultColumnSettings
    },
    {
      field: 'maxScore',
      headerName: 'ניקוד מירבי',
      ...defaultColumnSettings
    },
    ...rankingRounds.map(
      round =>
        ({
          field: `gp-${round}`,
          headerName: `GP ${round}`,
          type: 'number',
          headerAlign: 'center',
          align: 'center',
          width: 60
        }) as GridColDef
    ),
    {
      field: 'cvFormSeverities',
      headerName: `טפסי CV`,
      headerAlign: 'center',
      align: 'center',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: params => {
        return (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            height="100%"
            spacing={1}
          >
            {params.row.cvFormSeverities.map((severity, index) => (
              <Avatar
                key={index}
                sx={{ height: '30px', width: '30px' }}
                alt="חומרת הטופס"
                src={`https://emojicdn.elk.sh/${
                  cvFormSchema.categories.find(c => c.id === severity)?.emoji
                }`}
              />
            ))}
          </Stack>
        );
      }
    } as GridColDef<(typeof rows)[number]>
  ];

  return (
    <Paper
      component={Box}
      width="100%"
      height="100%"
      sx={{
        '& .total-cell': {
          backgroundColor: '#f4f4f4',
          fontWeight: '500'
        }
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        rowHeight={40}
        disableRowSelectionOnClick
        hideFooter
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100
            }
          },
          sorting: {
            sortModel: [{ field: 'sum', sort: 'desc' }]
          }
        }}
        sx={{
          maxHeight: 696,
          '& .MuiDataGrid-columnHeaderTitle': {
            textOverflow: 'clip',
            whiteSpace: 'wrap',
            textAlign: 'center'
          }
        }}
      />
    </Paper>
  );
};

export default ChampionsDeliberationsGrid;
