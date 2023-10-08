import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Event } from '@lems/types';
import { getApiBase } from '../../lib/utils/fetch';

interface DownloadUsersButtonProps extends ButtonProps {
  event: WithId<Event>;
}

const DownloadUsersButton: React.FC<DownloadUsersButtonProps> = ({ event, ...props }) => {
  return (
    <Button
      component="a"
      startIcon={<DownloadIcon />}
      variant="contained"
      href={`${getApiBase(true)}/api/admin/events/${event._id}/users/export`}
      target="_blank"
      download
      {...props}
    >
      הורדת קובץ סיסמאות
    </Button>
  );
};

export default DownloadUsersButton;
