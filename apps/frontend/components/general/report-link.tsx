import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import { Event } from '@lems/types';

interface ReportLinkProps {
  event: WithId<Event>;
}

const ReportLink: React.FC<ReportLinkProps> = ({ event }) => {
  const router = useRouter();
  return (
    <Tooltip title="דוחות" arrow>
      <IconButton aria-label="דוחות" onClick={() => router.push(`/event/${event._id}/reports`)}>
        <FeedRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ReportLink;
