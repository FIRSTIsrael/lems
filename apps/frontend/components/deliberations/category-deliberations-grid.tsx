import { WithId } from 'mongodb';
import { Paper, Box, IconButton, Avatar, Stack } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm
} from '@lems/types';
import { rubricsSchemas, RubricSchemaSection, cvFormSchema } from '@lems/season';
import {
  getBackgroundColor,
  getHoverBackgroundColor,
  getSelectedBackgroundColor,
  getSelectedHoverBackgroundColor
} from '../../lib/utils/theme';
interface CategoryDeliberationsGridProps {
  category: JudgingCategory;
  teams: Array<WithId<Team>>;
  selectedTeams: Array<number>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

const CategoryDeliberationsGrid: React.FC<CategoryDeliberationsGridProps> = ({
  category,
  teams,
  selectedTeams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets
}) => {
  const schema = rubricsSchemas[category];
  const fields = schema.sections.flatMap((section: RubricSchemaSection) =>
    section.fields.map(field => ({ field: field.id, headerName: field.title }))
  );
  const awards = schema.awards?.map(award => ({ field: award.id, headerName: award.title })) || [];
  const rankingRounds = [
    ...new Set(scoresheets.filter(s => s.stage === 'ranking').flatMap(s => s.round))
  ];

  const rows = teams
    .filter(t => t.registered)
    .map(team => {
      const rubric = rubrics
        .filter(r => r.category === category && r.status !== 'empty')
        .find(r => r.teamId.toString() === team._id.toString()); //Assert there exists a rubric (! at the end).
      const roomId = sessions.find(
        session => session.teamId?.toString() === team._id.toString()
      )?.roomId;
      const roomName = rooms.find(room => room._id.toString() === roomId?.toString())?.name;
      const rubricValues = rubric?.data?.values || {};
      const rubricAwards = rubric?.data?.awards || {};
      const rowValues: { [key: string]: number } = {};
      Object.entries(rubricValues).forEach(([key, entry]) => {
        rowValues[key] = entry.value;
      });
      const cvFormSeverities = cvForms
        .filter(cvform => cvform.demonstratorAffiliation === team?.number.toString())
        .map(cvForm => cvForm.severity);

      if (category === 'core-values') {
        scoresheets
          .filter(scoresheet => scoresheet.teamId.toString() === team._id.toString())
          .forEach(
            scoresheet => (rowValues[`gp-${scoresheet.round}`] = scoresheet.data?.gp?.value || 3)
          );
      }

      const sum = Object.values(rowValues).reduce((acc, current) => acc + current, 0);
      return {
        id: team._id,
        rubricId: rubric?._id,
        team,
        room: roomName,
        ...rowValues,
        sum,
        rubricAwards,
        cvFormSeverities
      };
    });

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
    ...fields.map(
      field =>
        ({
          ...field,
          type: 'number',
          width: 80,
          headerAlign: 'center',
          align: 'center'
        }) as GridColDef
    ),
    ...(category === 'core-values'
      ? rankingRounds.map(
          round =>
            ({
              field: `gp-${round}`,
              headerName: `GP ${round}`,
              type: 'number',
              headerAlign: 'center',
              align: 'center',
              width: 60
            }) as GridColDef
        )
      : []),
    {
      field: 'sum',
      headerName: 'סה"כ',
      type: 'number',
      width: 60,
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'sum-cell'
    },
    ...awards.map(
      award =>
        ({
          ...award,
          type: 'boolean',
          width: 65
        }) as GridColDef
    ),
    ...(category === 'core-values'
      ? [
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
        ]
      : []),
    {
      field: 'rubricId',
      headerName: 'מחוון',
      width: 60,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      renderCell: params => {
        return (
          <Box display="flex" justifyContent="center">
            <IconButton
              href={`/lems/team/${params.row.team?._id}/rubric/${category}`}
              color="info"
              target="_blank"
            >
              <DescriptionIcon />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  return (
    <Paper
      component={Box}
      width="100%"
      height="100%"
      sx={{
        '& .sum-cell': {
          backgroundColor: '#eeeeee99',
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
        getRowClassName={params =>
          selectedTeams.includes(params.row.team.number) ? 'selected-team' : ''
        }
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
          maxHeight: 670,
          '& .selected-team': {
            backgroundColor: getBackgroundColor('#32a84c', 'light'),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor('#32a84c', 'light')
            }
          },
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

export default CategoryDeliberationsGrid;
