import { LocalizedMission, Mission, MissionClause, localizedScoresheet } from '@lems/season';
import { Box, Button, ButtonGroup, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface MissionClauseProps {
  index: number;
  clause: MissionClause;
  localizedMission: LocalizedMission;
}

const MissionClause: React.FC<MissionClauseProps> = ({ index, clause, localizedMission }) => {
  return (
    <>
      <Grid xs={10} mt={2} ml={3}>
        <ReactMarkdown>{localizedMission.clauses[index].description}</ReactMarkdown>
      </Grid>
      <Grid xs={12} ml={3}>
        {clause.type === 'boolean' ? (
          <ButtonGroup variant="contained">
            <Button>כן</Button>
            <Button>לא</Button>
          </ButtonGroup>
        ) : clause.type === 'enum' ? (
          <ButtonGroup variant="contained">
            {localizedMission.clauses[index].labels?.map(label => (
              <Button key={label}>{label}</Button>
            ))}
          </ButtonGroup>
        ) : (
          <></>
        )}
      </Grid>
    </>
  );
};

interface ScoresheetMissionProps {
  mission: Mission;
  src: string;
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({ mission, src }) => {
  const localizedMission = localizedScoresheet.missions.find(m => m.id === mission.id);

  console.log(src);
  return (
    localizedMission && (
      <Grid component={Paper} container spacing={0} pb={2}>
        <Grid container xs={8} spacing={0}>
          <Grid
            xs={6}
            alignSelf="flex-start"
            bgcolor="#388e3c"
            borderRadius="8px 0 0 0"
            textAlign="center"
          >
            <Typography fontSize="1.5rem" fontWeight={600} color="#fff">
              {mission.id.toUpperCase()}
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography fontSize="1.5rem" fontWeight={600} pl={2}>
              {localizedMission.title}
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography fontSize="1rem">{localizedMission.description}</Typography>
          </Grid>
          {mission.clauses.map((clause, index) => (
            <MissionClause
              key={index}
              index={index}
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
        <Grid component="img" src={src} alt={`תמונה של משימה ${mission.id}`} xs={4} />
      </Grid>
    )
  );
};

export default ScoresheetMission;
