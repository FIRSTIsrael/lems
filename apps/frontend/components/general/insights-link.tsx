import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { Division } from '@lems/types';

interface InsightsLinkProps {
  division: WithId<Division>;
}

const InsightsLink: React.FC<InsightsLinkProps> = ({ division }) => {
  return (
    <Tooltip title="ניתוח אירוע" arrow>
      <IconButton aria-label="ניתוח אירוע" href={`/lems/${division._id}/insights`}>
        <InsightsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default InsightsLink;
