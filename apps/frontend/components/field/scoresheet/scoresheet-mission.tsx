import { LocalizedMission, Mission, MissionClause, localizedScoresheet } from '@lems/season';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import { Field } from 'formik';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CustomNumberInput from './number-input';

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
        {/* <Field> */}
        {clause.type === 'boolean' ? (
          <ToggleButtonGroup color="success">
            <ToggleButton value="yes">כן</ToggleButton>
            <ToggleButton value="no">לא</ToggleButton>
          </ToggleButtonGroup>
        ) : clause.type === 'enum' ? (
          <ToggleButtonGroup color="success">
            {localizedMission.clauses[index].labels?.map(label => (
              <ToggleButton key={label} value={clause.options ? clause.options[index] : ''}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <CustomNumberInput min={clause.min} max={clause.max} />
        )}
        {/* </Field> */}
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

  return (
    localizedMission && (
      <Grid component={Paper} container spacing={0} pb={2}>
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

export default ScoresheetMission;
