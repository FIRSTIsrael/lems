import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Division } from '@lems/types';
import { getApiBase } from '../../lib/utils/fetch';

interface DownloadUsersButtonProps extends ButtonProps {
  division: WithId<Division>;
}

const DownloadUsersButton: React.FC<DownloadUsersButtonProps> = ({ division, ...props }) => {
  return (
    <Button
      component="a"
      startIcon={<DownloadIcon />}
      variant="contained"
      href={`${getApiBase(true)}/api/admin/divisions/${division._id}/users/export`}
      target="_blank"
      download
      {...props}
    >
      הורדת קובץ סיסמאות
    </Button>
  );
};

export default DownloadUsersButton;
