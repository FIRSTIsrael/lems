import { Team, Scoresheet, SEASON_NAME } from '@lems/types';
import { serverSideGetRequests } from '../../../../../lib/utils/fetch';
import { WithId } from 'mongodb';
import { NextPage, GetServerSideProps } from 'next';
import {
  Box,
  Paper,
  Stack,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';
import {
  LocalizedMission,
  Mission,
  MissionClause,
  SEASON_SCORESHEET,
  localizedScoresheet
} from '@lems/season';
import { Event } from '@lems/types';
import Markdown from 'react-markdown';
import CustomNumberInput from '../../../../../components/field/scoresheet/number-input';

interface ExportMissionClauseProps {
  scoresheet: WithId<Scoresheet>;
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClause;
  localizedMission: LocalizedMission;
}

const MissionClause: React.FC<ExportMissionClauseProps> = ({
  scoresheet,
  missionIndex,
  clauseIndex,
  clause,
  localizedMission
}) => {
  return (
    <ThemeProvider
      theme={outerTheme => ({
        ...outerTheme,
        components: {
          MuiToggleButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  '&:hover': {
                    color: '#fff',
                    backgroundColor: '#81c784'
                  },
                  color: '#fff',
                  backgroundColor: '#388e3c'
                }
              }
            }
          }
        }
      })}
    >
      <Grid xs={10} mt={2} ml={3}>
        <Markdown>{localizedMission.clauses[clauseIndex].description}</Markdown>
      </Grid>
      <Grid xs={12} ml={3}>
        {clause.type === 'boolean' ? (
          <ToggleButtonGroup
            exclusive
            value={scoresheet.data?.missions[missionIndex].clauses[clauseIndex].value}
          >
            <ToggleButton value={false} sx={{ minWidth: '80px' }}>
              לא
            </ToggleButton>
            <ToggleButton value={true} sx={{ minWidth: '80px' }}>
              כן
            </ToggleButton>
          </ToggleButtonGroup>
        ) : clause.type === 'enum' ? (
          <ToggleButtonGroup
            exclusive
            value={scoresheet.data?.missions[missionIndex].clauses[clauseIndex].value}
          >
            {localizedMission.clauses[clauseIndex].labels?.map((label, index) => (
              <ToggleButton
                key={label}
                value={clause.options ? clause.options[index] : ''}
                sx={{
                  minWidth: `${Math.min(80, 520 / (localizedMission.clauses[clauseIndex].labels?.length || 0))}px`
                }}
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <CustomNumberInput
            min={clause.min}
            max={clause.max}
            value={Number(scoresheet.data?.missions[missionIndex].clauses[clauseIndex].value)}
          />
        )}
      </Grid>
    </ThemeProvider>
  );
};

interface ExportScoresheetMissionProps {
  scoresheet: WithId<Scoresheet>;
  missionIndex: number;
  mission: Mission;
  src: string;
}

const ExportScoresheetMission: React.FC<ExportScoresheetMissionProps> = ({
  scoresheet,
  missionIndex,
  mission,
  src
}) => {
  const localizedMission = localizedScoresheet.missions.find(m => m.id === mission.id);
  return (
    localizedMission && (
      <Grid
        component={Paper}
        container
        spacing={0}
        pb={2}
        id={mission.id}
        sx={{ scrollMarginTop: 300 }}
      >
        <Grid container xs={8} spacing={0}>
          <Grid
            py={1}
            xs={2}
            alignSelf="flex-start"
            bgcolor="#388e3c"
            borderRadius="8px 0 0 0"
            textAlign="center"
          >
            <Typography fontSize="1.5rem" fontWeight={600} color="#fff">
              {mission.id.toUpperCase()}
            </Typography>
          </Grid>
          <Grid xs={6} pt={1}>
            <Typography fontSize="1.5rem" fontWeight={600} pl={4}>
              {localizedMission.title}
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography fontSize="1rem">{localizedMission.description}</Typography>
          </Grid>
          {mission.clauses.map((clause, index) => (
            <MissionClause
              key={index}
              scoresheet={scoresheet}
              missionIndex={missionIndex}
              clauseIndex={index}
              clause={clause}
              localizedMission={localizedMission}
            />
          ))}
          <Grid xs={12} mt={2}>
            {localizedMission.remarks?.map(remark => (
              <Typography
                key={remark}
                pl={3}
                fontSize="1rem"
                color="primary"
                sx={{ fontStyle: 'italic' }}
              >
                {remark}
              </Typography>
            ))}
          </Grid>
        </Grid>
        <Grid component={Box} borderRadius={8} p={2} xs={4}>
          <Image
            src={src}
            width={0}
            height={0}
            sizes="100vw"
            alt={`תמונה של משימה ${mission.id}`}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: 'auto'
            }}
          />
        </Grid>
      </Grid>
    )
  );
};

interface ExportScoresheetPageProps {
  event: WithId<Event>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

const ExportScoresheetPage: React.FC<ExportScoresheetPageProps> = ({ event, team, scoresheet }) => {
  return (
    <>
      <Grid container>
        <Grid xs={10}>
          <Stack justifyContent="space-between" height="100%">
            <Typography fontSize="0.75rem" color="text.secondary">
              הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({scoresheet._id.toString()}) |{' '}
              {event.name} | עונת <span dir="ltr">{SEASON_NAME}</span>
            </Typography>
            <Typography fontSize="1.75rem" fontWeight={700}>
              דף ניקוד {scoresheet.round} של קבוצה #{team.number}
            </Typography>
          </Stack>
        </Grid>
        <Grid xs={2}>
          <img
            alt="לוגו של תוכניות FIRST LEGO League Challenge"
            src="/assets/audience-display/sponsors/fllc-horizontal.svg"
          />
        </Grid>
      </Grid>
      <Stack spacing={4}>
        {SEASON_SCORESHEET.missions.map((mission, index) => (
          <ExportScoresheetMission
            scoresheet={scoresheet}
            key={mission.id}
            missionIndex={index}
            src={`/assets/scoresheet/missions/${mission.id}.webp`}
            mission={mission}
          />
        ))}

        <Stack alignItems="center" mt={2} spacing={4}>
          <Image
            src={scoresheet.data?.signature || '/assets/scoresheet/blank-signature.svg'}
            alt={`חתימת קבוצה #${team.number}`}
            width={400}
            height={200}
            style={{ borderRadius: '8px', border: '1px solid #f1f1f1' }}
          />
          <Typography fontSize="2rem" fontWeight={700}>
            {scoresheet.data?.score} נקודות!
          </Typography>
        </Stack>
      </Stack>
      <Box
        sx={{
          '@media print': {
            pageBreakBefore: 'always'
          }
        }}
      />
    </>
  );
};

interface Props {
  event: WithId<Event>;
  team: WithId<Team>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({ event, team, scoresheets }) => {
  return scoresheets.map(scoresheet => (
    <ExportScoresheetPage
      key={scoresheet._id.toString()}
      event={event}
      team={team}
      scoresheet={scoresheet}
    />
  ));
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    {
      event: `/api/events/${ctx.params?.eventId}`,
      team: `/api/events/${ctx.params?.eventId}/teams/${ctx.params?.teamId}`,
      scoresheets: `/api/events/${ctx.params?.eventId}/teams/${ctx.params?.teamId}/scoresheets`
    },
    ctx
  );
  data.scoresheets = data.scoresheets.filter(
    (scoresheet: Scoresheet) => scoresheet.stage !== 'practice'
  );

  return { props: { ...data } };
};

export default Page;
