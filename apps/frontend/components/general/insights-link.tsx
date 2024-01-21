import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { Event } from '@lems/types';

interface InsightsLinkProps {
  event: WithId<Event>;
}

const InsightsLink: React.FC<InsightsLinkProps> = ({ event }) => {
  return (
    <Tooltip title="ניתוח אירוע" arrow>
      <IconButton aria-label="ניתוח אירוע" href={`/event/${event._id}/insights`}>
        <InsightsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default InsightsLink;
