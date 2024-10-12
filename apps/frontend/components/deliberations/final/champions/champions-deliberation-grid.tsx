import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DeliberationAnomaly } from '@lems/types';
import { cvFormSchema } from '@lems/season';
import AnomalyIcon from '../anomaly-icon';
import { DeliberationTeam } from '../../../../hooks/use-deliberation-teams';

interface ChampionsDeliberationGridProps {
  teams: Array<WithId<DeliberationTeam>>;
  anomalies: Array<DeliberationAnomaly>;
}

const ChampionsDeliberationsGrid: React.FC<ChampionsDeliberationGridProps> = ({
  teams,
  anomalies
}) => {
  const rankingRounds = [teams[0].gpScores.map(gp => gp.round)].flat();

  const rows = teams
    .sort((a, b) => a.totalRank - b.totalRank)
    .map((team, index) => {
      const gp: Record<string, number> = {};
      team.gpScores.forEach(score => (gp[`gp-${score.round}`] = score.score));

      return {
        id: team._id,
        team,
        room: team.room.name,
        place: index + 1,
        totalRank: team.totalRank,
        cvRank: team.ranks['core-values'],
        ipRank: team.ranks['innovation-project'],
        rdRank: team.ranks['robot-design'],
        rgRank: team.ranks['robot-game'],
        maxScore: team.maxRobotGameScore,
        cvFormSeverities: team.cvFormSeverities,
        consistency: team.robotConsistency,
        ...gp,
        anomalies: anomalies.filter(a => a.teamId === team._id)
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
      field: 'place',
      headerName: 'דירוג',
      type: 'number',
      width: 50,
      headerAlign: 'center',
      align: 'center'
    },
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
      field: 'anomaly',
      headerName: 'חריגות',
      headerAlign: 'center',
      align: 'center',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: params => {
        if (!params.row.anomalies || params.row.anomalies.length === 0) return null;
        return params.row.anomalies.map(anomaly => <AnomalyIcon anomaly={anomaly} />);
      }
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
      field: 'maxScore',
      headerName: 'ניקוד מירבי',
      ...defaultColumnSettings
    },
    {
      field: 'consistency',
      type: 'string',
      headerName: 'עקביות הרובוט',
      ...defaultColumnSettings,
      width: 70,
      valueGetter: (value: number, row) => Number(value.toFixed(2)) + '%'
    },
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
          maxHeight: 500,
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
