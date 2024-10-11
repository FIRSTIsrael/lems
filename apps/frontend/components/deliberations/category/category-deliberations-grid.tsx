import { ObjectId, WithId } from 'mongodb';
import { Paper, Box, IconButton, Avatar, Stack } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactPageRoundedIcon from '@mui/icons-material/ContactPageRounded';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  CoreValuesAwards,
  CoreValuesAwardsTypes
} from '@lems/types';
import { rubricsSchemas, RubricSchemaSection, cvFormSchema } from '@lems/season';
import { getBackgroundColor, getHoverBackgroundColor } from '../../../lib/utils/theme';
import { fullMatch, getDiff } from '@lems/utils/objects';

interface CategoryDeliberationsGridProps {
  category: JudgingCategory;
  teams: Array<WithId<Team>>;
  selectedTeams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  updateTeamAwards?: (
    teamId: ObjectId,
    rubricId: ObjectId,
    awards: { [key in CoreValuesAwards]: boolean }
  ) => void;
  disabled?: boolean;
  showRanks?: boolean;
  roomFactors?: Record<string, number>;
}

const CategoryDeliberationsGrid: React.FC<CategoryDeliberationsGridProps> = ({
  category,
  teams,
  selectedTeams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  updateTeamAwards,
  disabled = false,
  showRanks = false,
  roomFactors
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
    .map(team => {
      const rubric = rubrics
        .filter(r => r.category === category && r.status !== 'empty')
        .find(r => r.teamId.toString() === team._id.toString());
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
          .filter(scoresheet => scoresheet.teamId === team._id && scoresheet.stage === 'ranking')
          .forEach(
            scoresheet => (rowValues[`gp-${scoresheet.round}`] = scoresheet.data?.gp?.value || 3)
          );
      }

      const sum = Object.values(rowValues).reduce((acc, current) => acc + current, 0);
      return {
        id: team._id,
        rubricId: rubric?._id,
        team,
        roomId: roomId,
        room: roomName,
        ...rowValues,
        sum,
        ...rubricAwards,
        cvFormSeverities,
        rank: 0
      };
    })
    .sort((a, b) => b.sum - a.sum);

  rows[0].rank = 1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i].sum === rows[i - 1].sum) {
      rows[i].rank = rows[i - 1].rank;
    } else {
      rows[i].rank = i + 1;
    }
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    ...(showRanks
      ? [
          {
            field: 'rank',
            headerName: 'דירוג',
            type: 'number',
            width: 60,
            headerAlign: 'center',
            align: 'center'
          } as GridColDef<(typeof rows)[number]>
        ]
      : []),
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
    ...(!!roomFactors
      ? [
          {
            field: 'roomId',
            headerName: 'סה"כ מנורמל',
            type: 'number',
            width: 60,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (value, row) =>
              Number((row.sum * roomFactors[row.roomId!.toString()]).toFixed(2))
          } as GridColDef<(typeof rows)[number]>
        ]
      : []),
    ...awards.map(
      award =>
        ({
          ...award,
          type: 'boolean',
          editable: !disabled,
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
    },
    {
      field: 'profileDocumentUrl',
      headerName: 'דף מידע',
      width: 60,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      renderCell: params => {
        return (
          <Box display="flex" justifyContent="center">
            <IconButton
              href={params.row.team?.profileDocumentUrl ?? ''}
              disabled={!params.row.team?.profileDocumentUrl}
              color="info"
              target="_blank"
            >
              <ContactPageRoundedIcon />
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
        getRowClassName={params => (selectedTeams.includes(params.row.team) ? 'selected-team' : '')}
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
        processRowUpdate={(updatedRow, originalRow) => {
          if (!!updateTeamAwards && updatedRow.rubricId && !fullMatch(updatedRow, originalRow)) {
            // This assumes only awards can be edited. In case this changes we will need to
            // reimplement this function. Sorry :(
            const newAwards = getDiff(originalRow, updatedRow);
            const oldAwards: Record<string, any> = { ...originalRow };
            CoreValuesAwardsTypes.forEach(cvAward => {
              if (!newAwards.hasOwnProperty(cvAward)) {
                newAwards[cvAward] = oldAwards[cvAward] ?? false;
              }
            });
            updateTeamAwards(
              updatedRow.id,
              updatedRow.rubricId,
              newAwards as { [key in CoreValuesAwards]: boolean }
            );
          }
          return updatedRow;
        }}
        sx={{
          maxHeight: 696,
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
