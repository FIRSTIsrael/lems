import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import {
  DivisionWithEvent,
  JudgingCategory,
  Rubric,
  SEASON_NAME,
  SafeUser,
  Team
} from '@lems/types';
import { serverSideGetRequests } from '../../../../lib/utils/fetch';
import Grid from '@mui/material/Grid2';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { localizedJudgingCategory, rubricsSchemas } from '@lems/season';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import Markdown from 'react-markdown';
import HeaderRow from '../../../../components/judging/rubrics/header-row';
import TitleRow from '../../../../components/judging/rubrics/title-row';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { localizeDivisionTitle } from '../../../../localization/event';
import { getUserAndDivision } from '../../../../lib/utils/fetch';

interface ExportRubricPageProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
}

const ExportRubricPage: React.FC<ExportRubricPageProps> = ({ division, team, rubric }) => {
  const schema = rubricsSchemas[rubric.category];
  const isCoreValues = rubric.category === 'core-values';

  return (
    <>
      <Grid container>
        <Grid size={10}>
          <Stack justifyContent="space-between" height="100%">
            <Typography fontSize="0.75rem" color="textSecondary">
              הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({rubric._id.toString()}) |{' '}
              {localizeDivisionTitle(division)} | עונת <span dir="ltr">{SEASON_NAME}</span>
            </Typography>
            <Typography fontSize="1.75rem" fontWeight={700}>
              מחוון {localizedJudgingCategory[rubric.category].name} של קבוצה #{team.number}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={2}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="לוגו של תוכניות FIRST LEGO League Challenge"
            src="/assets/audience-display/sponsors/fllc-horizontal.svg"
          />
        </Grid>
        <Grid size={isCoreValues ? 4 : 12}>
          <Typography fontSize="0.875rem">
            <Markdown>{schema.description}</Markdown>
          </Typography>
        </Grid>
        {isCoreValues && schema.awards && (
          <Grid size={8}>
            <Typography variant="body2" gutterBottom textAlign="center">
              אם הקבוצה הצטיינה באחד התחומים הבאים, נא לסמן את המשבצת המתאימה:
            </Typography>
            {schema.awards.map(award => (
              <ListItem key={award.id} disablePadding>
                <ListItemButton
                  dense
                  sx={{ borderRadius: 2, px: 2 }}
                  disabled={!rubric.data?.awards?.[award.id]}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      tabIndex={-1}
                      disableRipple
                      icon={
                        <UncheckedIcon
                          sx={{
                            fontSize: '1.5em',
                            color: 'rgba(0,0,0,0.24)'
                          }}
                        />
                      }
                      checkedIcon={<CheckedIcon sx={{ fontSize: '1.5em', color: '#0071e3' }} />}
                      checked={rubric.data?.awards?.[award.id]}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <b>{award.title} - </b>{' '}
                    <Markdown
                      skipHtml
                      components={{
                        p: 'span'
                      }}
                    >
                      {award.description}
                    </Markdown>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </Grid>
        )}
        <Grid mb={2} size={12}>
          <Table
            sx={{
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              width: '100%',
              pageBreakInside: 'avoid'
            }}
          >
            <TableHead sx={{ border: '2px solid #000', p: '0.5rem 0.25rem' }}>
              <HeaderRow
                columns={schema.columns}
                category={schema.category}
                hideDescriptions={schema.category !== 'core-values'}
              />
            </TableHead>
            {schema.sections.map(section => (
              <TableBody key={section.title}>
                <TitleRow
                  title={section.title}
                  description={section.description}
                  category={schema.category}
                />
                {section.fields.map(field => {
                  const labels = [field.label_1, field.label_2, field.label_3, field.label_4];
                  const rubricValues = rubric.data?.values;

                  return (
                    <>
                      <TableRow>
                        {labels.map((label, index) => {
                          const cellValue = index + 1;

                          const isCellSelected = rubricValues?.[field.id]?.value === cellValue;
                          return (
                            <TableCell
                              key={label ? label + index : index}
                              align={label ? 'left' : 'center'}
                              sx={{
                                border: '2px solid #000',
                                fontSize: '0.75em',
                                p: '0 0.5em',
                                backgroundColor: '#fff'
                              }}
                            >
                              <FormControlLabel
                                value={cellValue}
                                control={
                                  <Radio
                                    disableRipple
                                    sx={{ pl: '0.1em' }}
                                    icon={
                                      <UncheckedIcon
                                        sx={{
                                          fontSize: '1.5em',
                                          color: 'rgba(0,0,0,0.24)'
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <CheckedIcon sx={{ fontSize: '1.5em', color: '#0071e3' }} />
                                    }
                                    checked={isCellSelected}
                                  />
                                }
                                disabled={!isCellSelected}
                                label={
                                  <Typography
                                    fontSize="0.75em"
                                    fontWeight={isCellSelected ? 700 : undefined}
                                    color={!isCellSelected ? 'textSecondary' : ''}
                                  >
                                    <Markdown skipHtml>{label || ''}</Markdown>
                                  </Typography>
                                }
                                sx={{ mx: 0 }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {rubricValues?.[field.id].value === 4 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{
                              border: '2px solid #000',
                              backgroundColor: '#f1f1f1',
                              py: 0
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', py: '0.25em' }}>
                              <Typography
                                fontWeight={500}
                                sx={{
                                  mr: 0.75,
                                  color: 'rgba(0,0,0,0.6)'
                                }}
                                fontSize="0.875rem"
                              >
                                נימוק:
                              </Typography>
                              <Typography fontSize="0.875rem">
                                {rubricValues?.[field.id].notes}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            ))}
          </Table>
        </Grid>
        <Grid size={5.5}>
          <Stack spacing={1} textAlign="center">
            <Typography fontWeight={700}>{schema.feedback?.fields.greatJob}</Typography>
            <Typography fontSize="0.875rem">{rubric.data?.feedback.greatJob}</Typography>
          </Stack>
        </Grid>
        <Grid size={1}>
          <Divider orientation="vertical" variant="middle" />
        </Grid>
        <Grid size={5.5}>
          <Stack spacing={1} textAlign="center">
            <Typography fontWeight={700}>{schema.feedback?.fields.thinkAbout}</Typography>
            <Typography fontSize="0.875rem">{rubric.data?.feedback.thinkAbout}</Typography>
          </Stack>
        </Grid>
      </Grid>
      {!isCoreValues && (
        <Box
          sx={{
            '@media print': {
              pageBreakBefore: 'always'
            }
          }}
        />
      )}
    </>
  );
};

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({ user, division, team, rubrics }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      {rubrics.map(rubric => (
        <ExportRubricPage
          key={rubric._id.toString()}
          division={division}
          team={team}
          rubric={rubric}
        />
      ))}
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user, divisionId } = await getUserAndDivision(ctx);

  try {
    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        team: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}`,
        rubrics: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
