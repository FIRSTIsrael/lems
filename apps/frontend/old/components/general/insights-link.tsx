import { Tooltip, IconButton } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { useRouter } from 'next/router';

const InsightsLink: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    const queryString = router.query.divisionId
      ? new URLSearchParams({ divisionId: router.query.divisionId as string }).toString()
      : '';
    const url = `/lems/insights${queryString ? `?${queryString}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <Tooltip title="ניתוח אירוע" arrow>
      <IconButton onClick={handleClick}>
        <InsightsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default InsightsLink;
