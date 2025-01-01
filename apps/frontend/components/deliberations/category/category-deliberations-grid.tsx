import { ObjectId } from 'mongodb';
import { Paper, Box, IconButton, Avatar, Stack, Typography } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactPageRoundedIcon from '@mui/icons-material/ContactPageRounded';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { JudgingCategory, CoreValuesAwardsTypes, CoreValuesAwards } from '@lems/types';
import {
  rubricsSchemas,
  RubricSchemaSection,
  cvFormSchema,
  inferCvrubricSchema
} from '@lems/season';
import { getBackgroundColor, getHoverBackgroundColor } from '../../../lib/utils/theme';
import { fullMatch, getDiff } from '@lems/utils/objects';
import { DeliberationTeam } from '../../../hooks/use-deliberation-teams';
import { rankArray } from '@lems/utils/arrays';

interface CategoryDeliberationsGridProps {
  category: JudgingCategory;
  teams: Array<DeliberationTeam>;
  selectedTeams: Array<ObjectId>;
  updateTeamAwards?: (
    teamId: ObjectId,
    rubricId: ObjectId,
    awards: { [key in CoreValuesAwards]: boolean }
  ) => void;
  disabled?: boolean;
  showRanks?: boolean;
  showNormalizedScores?: boolean;
}

const CategoryDeliberationsGrid: React.FC<CategoryDeliberationsGridProps> = ({
  category,
  teams,
  selectedTeams,
  updateTeamAwards,
  disabled = false,
  showRanks = false,
  showNormalizedScores = false
}) => {
  let schema = rubricsSchemas[category];
  if (category === 'core-values') schema = inferCvrubricSchema();

  const fields = schema.sections.flatMap((section: RubricSchemaSection) =>
    section.fields.map(field => ({ field: field.id, headerName: field.title }))
  );

  const awards = schema.awards?.map(award => ({ field: award.id, headerName: award.title })) || [];
  const rankingRounds = [teams[0]?.gpScores.map(gp => gp.round)].flat();

  let rows = teams
    .map(team => {
      const rowValues = team.rubricFields[category];
      if (category === 'core-values') {
        team.gpScores.forEach(gp => (rowValues[`gp-${gp.round}`] = gp.score));
      }
      return {
        id: team._id,
        rubricId: team.rubricIds[category],
        team,
        sum: team.scores[category],
        roomId: team.room._id,
        room: team.room.name,
        ...rowValues,
        ...team.optionalAwardNominations
      };
    })
    .sort((a, b) => b.sum - a.sum);
  rows = rankArray(rows, row => row.team.scores[category], 'rank');

  const defaultColumnSettings: Partial<GridColDef<(typeof rows)[number]>> = {
    type: 'number',
    width: 60,
    headerAlign: 'center',
    align: 'center'
  };
  const columns: GridColDef<(typeof rows)[number]>[] = [
    ...(showRanks
      ? [
          {
            field: 'rank',
            headerName: 'דירוג',
            ...defaultColumnSettings
          } as GridColDef<(typeof rows)[number]>
        ]
      : []),
    {
      field: 'teamNumber',
      headerName: 'מספר קבוצה',
      ...defaultColumnSettings,
      type: 'string',
      width: 80,
      valueGetter: (value, row) => row.team?.number
    },
    {
      field: 'room',
      headerName: 'חדר',
      ...defaultColumnSettings,
      type: 'string',
      width: 70
    },
    ...fields.map(
      field =>
        ({
          ...field,
          ...defaultColumnSettings,
          width: 75
        }) as GridColDef
    ),
    ...(category === 'core-values'
      ? rankingRounds.map(
          round =>
            ({
              field: `gp-${round}`,
              headerName: `GP ${round}`,
              renderCell: params => {
                return (
                  <Typography
                    component="span"
                    fontWeight={Number(params.value) === 3 ? undefined : 700}
                    fontSize="0.875rem"
                  >
                    {params.value}
                  </Typography>
                );
              },
              ...defaultColumnSettings
            }) as GridColDef
        )
      : []),
    {
      field: 'sum',
      headerName: 'סה"כ',
      ...defaultColumnSettings,
      cellClassName: 'sum-cell'
    },
    ...(showNormalizedScores
      ? [
          {
            field: 'normalized',
            headerName: 'סה"כ מנורמל',
            ...defaultColumnSettings,
            valueGetter: (value, row) => row.team.normalizedScores[category]
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
                  {params.row.team.cvFormSeverities.map((severity, index) => (
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
      width: 50,
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
      width: 50,
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
        getRowClassName={params =>
          selectedTeams.includes(params.row.team._id) ? 'selected-team' : ''
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
        processRowUpdate={(updatedRow, originalRow) => {
          if (!!updateTeamAwards && updatedRow.rubricId && !fullMatch(updatedRow, originalRow)) {
            const newAwards = getDiff(originalRow, updatedRow);
            const oldAwards: Record<string, unknown> = { ...originalRow };
            CoreValuesAwardsTypes.forEach(cvAward => {
              if (!Object.prototype.hasOwnProperty.call(newAwards, cvAward)) {
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
