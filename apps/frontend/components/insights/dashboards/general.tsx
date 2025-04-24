import { WithId } from 'mongodb';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import { Division, Team } from '@lems/types';
import Stat from '../stat';
import TeamInsightsDashboard from './team';

interface GeneralInsightsDashboardProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
}

const GeneralInsightsDashboard: React.FC<GeneralInsightsDashboardProps> = ({ division, teams }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={4}>
        <Stat
          title="קבוצות באירוע"
          variant="header"
          color={blue[500]}
          url={`/api/divisions/${division._id}/insights/general/total-teams`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <Stat
          title="קריאות שטופלו"
          variant="header"
          color={blue[500]}
          url={`/api/divisions/${division._id}/insights/general/total-tickets`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <Stat
          title="טפסי CV שטופלו"
          variant="header"
          color={blue[500]}
          url={`/api/divisions/${division._id}/insights/general/total-cv-forms`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={12}>
        <TeamInsightsDashboard division={division} teams={teams} />
      </Grid>
    </Grid>
  );
};

export default GeneralInsightsDashboard;
