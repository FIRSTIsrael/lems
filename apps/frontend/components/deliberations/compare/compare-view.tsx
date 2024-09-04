import { createContext, useContext, useState } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Stack, Box, Typography, Divider, Avatar } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Rubric, JudgingCategory, Team, CoreValuesForm, Scoresheet } from '@lems/types';
import CompareRubricRemarks from './compare-rubric-remarks';
import CompareNominations from './compare-nominations';
import CompareBatteryChart from './compare-battery-chart';
import CompareGpScores from './compare-gp-scores';
import CompareRubricScores from './compare-rubric-scores';
import CompareExceedingRemarks from './compare-exceeding-remarks';

export interface CompareContextType {
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
  category?: JudgingCategory;
}

export const CompareContext = createContext<CompareContextType>(null as any);

interface CompareViewProps {
  compareTeamIds: Array<ObjectId>;
  category?: JudgingCategory;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
}

const CompareView: React.FC<CompareViewProps> = ({
  compareTeamIds,
  teams,
  rubrics,
  scoresheets,
  cvForms,
  category
}) => {
  const compareTeams = teams.filter(t => compareTeamIds.includes(t._id));
  const compareRubrics = rubrics.filter(r => compareTeamIds.includes(r.teamId));
  const compareCvForms = cvForms.filter(
    cvf =>
      cvf.demonstratorAffiliation &&
      compareTeams.map(t => t.number.toString()).includes(cvf.demonstratorAffiliation)
  );
  const compareScoresheets = scoresheets.filter(
    s => compareTeamIds.includes(s.teamId) && s.stage !== 'practice'
  );
  const [compareData, setCompareData] = useState({
    teams: compareTeams,
    rubrics: compareRubrics,
    scoresheets: compareScoresheets,
    cvForms: compareCvForms,
    category
  });

  return (
    <CompareContext.Provider value={compareData}>
      <Grid container sx={{ mt: 2 }}>
        {compareTeamIds.map(teamId => (
          <CompareViewTeam teamId={teamId} />
        ))}
      </Grid>
    </CompareContext.Provider>
  );
};

interface CompareViewTeamProps {
  teamId: ObjectId;
}

const CompareViewTeam: React.FC<CompareViewTeamProps> = ({ teamId }) => {
  const { teams, rubrics, cvForms, category } = useContext(CompareContext);
  const team = teams.find(t => t._id === teamId);

  if (!team) return null;

  return (
    <Grid component={Paper} xs={12 / teams.length} height="100%">
      <Stack
        divider={
          <Divider
            sx={{ my: 1, width: '97%', alignSelf: 'center', borderWidth: 1.5, borderRadius: 20 }}
          />
        }
      >
        <Stack direction="row">
          <Typography>{team.number}</Typography>
          <Avatar alt="HG" />
        </Stack>
        <CompareBatteryChart teamId={teamId} />
        <CompareRubricScores teamId={teamId} />
        <CompareExceedingRemarks teamId={teamId} />
        <CompareNominations teamId={teamId} />
        <CompareGpScores teamId={teamId} />
        <CompareRubricRemarks teamId={teamId} />
      </Stack>
    </Grid>
  );
};

export default CompareView;
