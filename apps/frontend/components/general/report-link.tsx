import { WithId } from 'mongodb';
import { Tooltip, IconButton } from '@mui/material';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import { Division } from '@lems/types';

interface ReportLinkProps {
  division: WithId<Division>;
}

const ReportLink: React.FC<ReportLinkProps> = ({ division }) => {
  return (
    <Tooltip title="דוחות" arrow>
      <IconButton aria-label="דוחות" href={`/lems/reports`} target="_blank">
        <FeedRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ReportLink;
