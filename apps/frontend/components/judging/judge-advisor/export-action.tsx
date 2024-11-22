import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Division } from '@lems/types';
import { getApiBase } from '../../../lib/utils/fetch';

interface ExportActionProps extends ButtonProps {
  division: WithId<Division>;
  path: string;
  children: React.ReactNode;
}

const ExportAction: React.FC<ExportActionProps> = ({ division, path, children, ...props }) => {
  return (
    <Button
      component="a"
      startIcon={<DownloadIcon />}
      variant="contained"
      color="inherit"
      href={`${getApiBase(true)}/api/divisions/${division._id}/export${path}`}
      target="_blank"
      download
      {...props}
      sx={{ width: '100%' }}
    >
      {children}
    </Button>
  );
};

export default ExportAction;
