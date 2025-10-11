import { WithId } from 'mongodb';
import { Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Scoresheet } from '@lems/types';
import { MissionSchema, localizedScoresheet } from '@lems/season';
import { ScoresheetMissionClause } from './scoresheet-mission-clause';

interface ScoresheetMissionProps {
  scoresheet: WithId<Scoresheet>;
  missionIndex: number;
  mission: MissionSchema;
}

export const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({
  scoresheet,
  missionIndex,
  mission
}) => {
  const localizedMission = localizedScoresheet.missions.find(m => m.id === mission.id);
  if (!localizedMission) return null;

  const missionScore =
    mission.calculation(
      ...(scoresheet.data?.missions[missionIndex]?.clauses.map(clause => clause.value ?? false) ??
        [])
    ) ?? 0;

  return (
    <Grid
      container
      component={Paper}
      sx={{
        border: '1px solid #2e7d32',
        borderRadius: '2px',
        overflow: 'hidden',
        minHeight: '1.7rem',
        '@media print': {
          pageBreakInside: 'avoid',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }
      }}
    >
      <Grid container size={10.5} rowSpacing={0.5}>
        <Grid
          alignSelf="flex-start"
          textAlign="center"
          size={1.5}
          sx={{
            bgcolor: '#2e7d32',
            color: '#FFF',
            '@media print': {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '1.7rem'
            }
          }}
        >
          <Typography fontWeight={800}>{mission.id.toUpperCase()}</Typography>
        </Grid>
        <Grid py={0.3} size={10.5}>
          <Typography fontSize="0.9rem" fontWeight={600} pl={0.5}>
            {localizedMission.title.toUpperCase()}
          </Typography>
        </Grid>
        <Grid size={12} px={1}>
          <Typography fontSize="0.75rem">{localizedMission.description}</Typography>
        </Grid>
        {mission.clauses.map((clause, index) => (
          <ScoresheetMissionClause
            key={index}
            scoresheet={scoresheet}
            missionIndex={missionIndex}
            clauseIndex={index}
            clause={clause}
            localizedMission={localizedMission}
          />
        ))}
      </Grid>
      <Grid
        size={1.5}
        sx={{
          bgcolor: '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography fontSize="1.25rem" fontWeight={600} sx={{ color: '#2e7d32' }}>
          {missionScore}
        </Typography>
      </Grid>
    </Grid>
  );
};
