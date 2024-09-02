import { createContext, useContext, useState } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Stack, Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Rubric, JudgingCategory, Team, CoreValuesForm } from '@lems/types';

export interface CompareContextType {
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  cvForms: Array<CoreValuesForm>;
  category?: JudgingCategory;
}

export const CompareContext = createContext<CompareContextType>(null as any);

interface CompareViewProps {
  compareTeamIds: Array<ObjectId>;
  category?: JudgingCategory;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  cvForms: Array<CoreValuesForm>;
}

const CompareView: React.FC<CompareViewProps> = ({
  compareTeamIds,
  teams,
  rubrics,
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
  const [compareData, setCompareData] = useState({
    teams: compareTeams,
    rubrics: compareRubrics,
    cvForms: compareCvForms,
    category
  });

  return (
    <CompareContext.Provider value={compareData}>
      <Grid container component={Paper} sx={{ mt: 2 }}>
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
    <Grid xs={6}>
      <Stack>
        <Box>{category ? <></> : <></>}</Box>
      </Stack>
    </Grid>
  );
};

export default CompareView;
