import { Team, Scoresheet, SEASON_NAME, SafeUser } from '@lems/types';
import { serverSideGetRequests } from '../../../../lib/utils/fetch';
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
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import {
  LocalizedMission,
  MissionSchema,
  MissionClauseSchema,
  SEASON_SCORESHEET,
  localizedScoresheet
} from '@lems/season';
import { DivisionWithEvent } from '@lems/types';
import Markdown from 'react-markdown';
import CustomNumberInput from '../../../../components/field/scoresheet/number-input';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { localizeDivisionTitle } from '../../../../localization/event';
import { getUserAndDivision } from '../../../../lib/utils/fetch';

interface ExportMissionClauseProps {
  scoresheet: WithId<Scoresheet>;
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClauseSchema;
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
      <Grid mt={2} ml={3} size={10}>
        <Markdown>{localizedMission.clauses[clauseIndex].description}</Markdown>
      </Grid>
      <Grid ml={3} size={12}>
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
  mission: MissionSchema;
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
        <Grid container spacing={0} size={8}>
          <Grid
            py={1}
            alignSelf="flex-start"
            bgcolor="#388e3c"
            borderRadius="8px 0 0 0"
            textAlign="center"
            size={2}
          >
            <Typography fontSize="1.5rem" fontWeight={600} sx={{ color: '#FFF' }}>
              {mission.id.toUpperCase()}
            </Typography>
          </Grid>
          <Grid pt={1} size={6}>
            <Typography fontSize="1.5rem" fontWeight={600} pl={4}>
              {localizedMission.title}
            </Typography>
          </Grid>
          <Grid size={12}>
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
          <Grid mt={2} size={12}>
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
      </Grid>
    )
  );
};

interface ExportScoresheetPageProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

const ExportScoresheetPage: React.FC<ExportScoresheetPageProps> = ({
  division,
  team,
  scoresheet
}) => {
  return (
    <>
      <Grid container>
        <Grid size={10}>
          <Stack justifyContent="space-between" height="100%">
            <Typography fontSize="0.75rem" color="textSecondary">
              הופק מתוך מערכת האירועים של <em>FIRST</em> ישראל ({scoresheet._id.toString()}) |{' '}
              {localizeDivisionTitle(division)} | עונת <span dir="ltr">{SEASON_NAME}</span>
            </Typography>
            <Typography fontSize="1.75rem" fontWeight={700}>
              דף ניקוד {scoresheet.round} של קבוצה #{team.number}
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
            {scoresheet.data?.score} נקודות
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
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({ user, division, team, scoresheets }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      {scoresheets.map(scoresheet => (
        <ExportScoresheetPage
          key={scoresheet._id.toString()}
          division={division}
          team={team}
          scoresheet={scoresheet}
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
        scoresheets: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/scoresheets`
      },
      ctx
    );
    data.scoresheets = data.scoresheets.filter(
      (scoresheet: Scoresheet) => scoresheet.stage !== 'practice'
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
