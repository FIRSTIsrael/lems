import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, Team } from '@lems/types';
import Stat from '../stat';
import TeamInsightsDashboard from './team';

interface GeneralInsightsDashboardProps {
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const GeneralInsightsDashboard: React.FC<GeneralInsightsDashboardProps> = ({ event, teams }) => {
  return (
    <Grid container spacing={2}>
      <Grid xs={4}>
        <Stat
          title="קבוצות באירוע"
          url={`/api/events/${event._id}/insights/general/total-teams`}
          sx={{ p: 2, width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}></Grid>
      <Grid xs={4}></Grid>
      <Grid xs={12}>
        <TeamInsightsDashboard event={event} teams={teams} />
      </Grid>
    </Grid>
  );
};

export default GeneralInsightsDashboard;
