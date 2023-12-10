import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import { Event } from '@lems/types';

interface ReportLinkProps {
  event: WithId<Event>;
}

const ReportLink: React.FC<ReportLinkProps> = ({ event }) => {
  return (
    <Tooltip title="דוחות" arrow>
      <IconButton aria-label="דוחות" href={`/event/${event._id}/reports`} target="_blank">
        <FeedRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ReportLink;
