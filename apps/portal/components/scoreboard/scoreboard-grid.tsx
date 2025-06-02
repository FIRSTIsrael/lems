import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery, Link } from '@mui/material';
import { DataGrid, GridColDef, GridComparatorFn } from '@mui/x-data-grid';
import { PortalScore } from '@lems/types';
import { compareScoreArrays } from '@lems/utils/arrays';
import NextLink from 'next/link';

interface ScoreboardGridProps {
  data: PortalScore[];
  eventId: string;
}

const ScoreboardGrid: React.FC<ScoreboardGridProps> = ({ data, eventId }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const scoreComparator: GridComparatorFn<PortalScore> = (a, b, paramA, paramB) => {
    const scoresA = paramA.api.getRow(paramA.id).scores;
    const scoresB = paramB.api.getRow(paramB.id).scores;
    return compareScoreArrays(scoresA, scoresB, true);
  };

  const matches = data[0]?.scores.length ?? 1;

  const teamData = data.map(row => ({
    team: row.team,
    scores: row.scores
  }));

  const sortedTeamData = teamData.sort((a, b) => compareScoreArrays(a.scores, b.scores));

  const columns: GridColDef<(typeof data)[number]>[] = [
    {
      field: 'rank',
      headerName: 'מקום',
      width: isDesktop ? 75 : 50,
      sortable: true,
      valueGetter: (_, row) => {
        return sortedTeamData?.findIndex(teamData => teamData.team.number === row.team.number) + 1;
      }
    },
    {
      field: 'teamName',
      headerName: 'קבוצה',
      width: isDesktop ? 225 : 100,
      renderCell: params => {
        const { team } = params.row;
        return (
          <Link
            component={NextLink}
            href={`/events/${eventId}/teams/${team.number}`}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.main'
              },
              fontWeight: 500
            }}
          >
            {isDesktop ? `${team.name} #${team.number}` : `#${team.number}`}
          </Link>
        );
      }
    },
    {
      field: 'maxScore',
      headerName: 'ניקוד',
      width: isDesktop ? 150 : 100,
      sortable: true,
      sortComparator: scoreComparator
    },
    ...Array.from(
      { length: matches },
      (_, index) =>
        ({
          field: `match${index + 1}`,
          headerName: `מקצה ${index + 1}`,
          width: isDesktop ? 150 : 100,

          valueGetter: (_, row) => {
            return row.scores[index];
          }
        }) as GridColDef<(typeof data)[number]>
    )
  ];

  return (
    <DataGrid
      rows={data}
      columns={columns}
      getRowId={row => row.team.id}
      slots={{
        noRowsOverlay: () => (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="body1">אין תוצאות</Typography>
          </Box>
        )
      }}
      initialState={{
        sorting: {
          sortModel: [{ field: 'maxScore', sort: 'desc' }]
        },
        pagination: {
          paginationModel: {
            pageSize: 25
          }
        }
      }}
      sx={{ textAlign: 'left' }}
      disableColumnMenu
    />
  );
};

export default ScoreboardGrid;
