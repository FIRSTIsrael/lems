import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { heIL } from '@mui/x-data-grid/locales';
import { PortalScore } from '@lems/types';
import theme from '../lib/theme';

interface ScoreboardGridProps {
  data: PortalScore[];
}

const ScoreboardGrid: React.FC<ScoreboardGridProps> = ({ data }) => {
  const localizedTheme = createTheme(theme, heIL);
  const isDesktop = useMediaQuery(localizedTheme.breakpoints.up('md'));

  const matches = data[0]?.scores.length ?? 1;
  const columns: GridColDef<(typeof data)[number]>[] = [
    {
      field: 'teamName',
      headerName: 'קבוצה',
      width: isDesktop ? 225 : 100,
      valueGetter: (_, row) => {
        if (isDesktop) {
          return `${row.team.name} #${row.team.number}`;
        }
        return `#${row.team.number}`;
      }
    },
    { field: 'maxScore', headerName: 'ניקוד', width: isDesktop ? 150 : 100 },
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
    <ThemeProvider theme={localizedTheme}>
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
        disableColumnMenu
      />
    </ThemeProvider>
  );
};

export default ScoreboardGrid;
