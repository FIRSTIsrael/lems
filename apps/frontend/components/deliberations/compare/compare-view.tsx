import { createContext, useContext, useState } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Stack, Divider, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Rubric, JudgingCategory, Team, CoreValuesForm, Scoresheet } from '@lems/types';
import CompareRubricRemarks from './compare-rubric-remarks';
import CompareNominations from './compare-nominations';
import CompareBatteryChart from './compare-battery-chart';
import CompareGpScores from './compare-gp-scores';
import CompareRubricScores from './compare-rubric-scores';
import CompareExceedingRemarks from './compare-exceeding-remarks';
import CompareTeamInfo from './compare-team-info';
import CompareCvForms from './compare-cv-forms';

export interface CompareContextType {
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
  category?: JudgingCategory;
}

export const CompareContext = createContext<CompareContextType>(null as any);

export interface CompareViewProps {
  height?: number;
  compareTeamIds: Array<ObjectId>;
  category?: JudgingCategory;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
  removeTeam?: (teamId: ObjectId) => void;
}

const CompareView: React.FC<CompareViewProps> = ({
  height,
  compareTeamIds,
  teams,
  rubrics,
  scoresheets,
  cvForms,
  category,
  removeTeam
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

  return (
    <CompareContext.Provider
      value={{
        teams: compareTeams,
        rubrics: compareRubrics,
        scoresheets: compareScoresheets,
        cvForms: compareCvForms,
        category
      }}
    >
      <Grid container columnGap={4} justifyContent="center">
        {compareTeamIds.map(teamId => (
          <CompareViewTeam teamId={teamId} removeTeam={removeTeam} />
        ))}
      </Grid>
    </CompareContext.Provider>
  );
};

interface CompareViewTeamProps {
  teamId: ObjectId;
  removeTeam?: (teamId: ObjectId) => void;
}

const CompareViewTeam: React.FC<CompareViewTeamProps> = ({ teamId, removeTeam }) => {
  const { category, teams } = useContext(CompareContext);
  const team = teams.find(t => t._id === teamId);

  if (!team) return null;

  return (
    (<Grid
      component={Paper}
      height="100%"
      p={2}
      mb={2}
      sx={{ overflowY: 'auto' }}
      size={Math.min(10.75 / teams.length, 6)}
    >
      {removeTeam && (
        <IconButton onClick={() => removeTeam(teamId)}>
          <CloseRounded />
        </IconButton>
      )}
      <Stack
        divider={<Divider sx={{ my: 2, width: '100%', alignSelf: 'center', borderWidth: 1 }} />}
      >
        <CompareTeamInfo teamId={teamId} />
        <CompareBatteryChart teamId={teamId} />
        <CompareRubricScores teamId={teamId} />
        <CompareExceedingRemarks teamId={teamId} />
        {(!category || category === 'core-values') && <CompareNominations teamId={teamId} />}
        <CompareGpScores teamId={teamId} />
        <CompareRubricRemarks teamId={teamId} />
        <CompareCvForms teamId={teamId} />
      </Stack>
    </Grid>)
  );
};

export default CompareView;
