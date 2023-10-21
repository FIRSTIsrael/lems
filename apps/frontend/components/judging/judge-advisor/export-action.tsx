import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Event } from '@lems/types';
import { getApiBase } from '../../../lib/utils/fetch';

interface ExportActionProps extends ButtonProps {
  event: WithId<Event>;
  path: string;
  children: React.ReactNode;
}

const ExportAction: React.FC<ExportActionProps> = ({ event, path, children, ...props }) => {
  return (
    <Button
      component="a"
      startIcon={<DownloadIcon />}
      variant="contained"
      color="inherit"
      href={`${getApiBase(true)}/api/admin/events/${event._id}/export${path}`}
      target="_blank"
      download
      {...props}
    >
      {children}
    </Button>
  );
};

export default ExportAction;
