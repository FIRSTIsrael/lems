import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Event, JudgingCategory, Rubric, SEASON_NAME, Team } from '@lems/types';
import { serverSideGetRequests } from '../../../../../lib/utils/fetch';
import Grid from '@mui/material/Unstable_Grid2';
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
import HeaderRow from '../../../../../components/judging/rubrics/header-row';
import TitleRow from '../../../../../components/judging/rubrics/title-row';

interface ExportRubricPageProps {
  event: WithId<Event>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
}

const ExportRubricPage: React.FC<ExportRubricPageProps> = ({ event, team, rubric }) => {
  const schema = rubricsSchemas[rubric.category];
  const isCoreValues = rubric.category === 'core-values';
  return (
    <>
      <Grid container>
        <Grid xs={10}>
          <Stack justifyContent="space-between" height="100%">
            <Typography fontSize="0.75rem" color="text.secondary">
              הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({rubric._id.toString()}) |{' '}
              {event.name} | עונת <span dir="ltr">{SEASON_NAME}</span>
            </Typography>
            <Typography fontSize="1.75rem" fontWeight={700}>
              מחוון {localizedJudgingCategory[rubric.category].name} של קבוצה #{team.number}
            </Typography>
          </Stack>
        </Grid>
        <Grid xs={2}>
          <img
            alt="לוגו של תוכניות FIRST LEGO League Challenge"
            src="/assets/audience-display/sponsors/fllc-horizontal.svg"
          />
        </Grid>
        <Grid xs={isCoreValues ? 4 : 12}>
          <Typography fontSize="0.875rem">
            <Markdown>{schema.description}</Markdown>
          </Typography>
        </Grid>
        {isCoreValues && schema.awards && (
          <Grid xs={8}>
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
        <Grid xs={12} mb={2}>
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

                  return (
                    <>
                      <TableRow>
                        {labels.map((label, index) => {
                          const cellValue = index + 1;
                          const selectedCell = rubric.data?.values?.[field.id]?.value === cellValue;
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
                                    checked={selectedCell}
                                  />
                                }
                                disabled={!selectedCell}
                                label={
                                  <Typography
                                    fontSize="0.75em"
                                    fontWeight={selectedCell ? 700 : undefined}
                                    color={!selectedCell ? 'text.secondary' : ''}
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
                      {rubric.data?.values?.[field.id].value === 4 && (
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
                                {rubric.data?.values?.[field.id].notes}
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
        <Grid xs={5.5}>
          <Stack spacing={1} textAlign="center">
            <Typography fontWeight={700}>{schema.feedback?.[0].title}</Typography>
            <Typography fontSize="0.875rem">{rubric.data?.feedback.greatJob}</Typography>
          </Stack>
        </Grid>
        <Grid xs={1}>
          <Divider orientation="vertical" variant="middle" />
        </Grid>
        <Grid xs={5.5}>
          <Stack spacing={1} textAlign="center">
            <Typography fontWeight={700}>{schema.feedback?.[1].title}</Typography>
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
  event: WithId<Event>;
  team: WithId<Team>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({ event, team, rubrics }) => {
  return rubrics.map(rubric => (
    <ExportRubricPage key={rubric._id.toString()} event={event} team={team} rubric={rubric} />
  ));
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    {
      event: `/api/events/${ctx.params?.eventId}`,
      team: `/api/events/${ctx.params?.eventId}/teams/${ctx.params?.teamId}`,
      rubrics: `/api/events/${ctx.params?.eventId}/teams/${ctx.params?.teamId}/rubrics`
    },
    ctx
  );

  return { props: { ...data } };
};

export default Page;
