import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { Event } from '@lems/types';

interface InsightsLinkProps {
  division: WithId<Event>;
}

const InsightsLink: React.FC<InsightsLinkProps> = ({ division }) => {
  return (
    <Tooltip title="ניתוח אירוע" arrow>
      <IconButton aria-label="ניתוח אירוע" href={`/division/${division._id}/insights`}>
        <InsightsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default InsightsLink;
