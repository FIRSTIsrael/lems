import { Tooltip, IconButton } from '@mui/material';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import { useRouter } from 'next/router';

const ReportLink: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    const queryString = router.query.divisionId
      ? new URLSearchParams({ divisionId: router.query.divisionId as string }).toString()
      : '';
    const url = `/lems/reports${queryString ? `?${queryString}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <Tooltip title="דוחות" arrow>
      <IconButton onClick={handleClick}>
        <FeedRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ReportLink;
