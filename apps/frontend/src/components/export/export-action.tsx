import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getApiBase } from '../../lib/utils/fetch';

interface ExportActionProps extends ButtonProps {
  divisionId: string;
  path: string;
  children: React.ReactNode;
}

const ExportAction: React.FC<ExportActionProps> = ({ divisionId, path, children, ...props }) => {
  return (
    <Button
      component="a"
      startIcon={<DownloadIcon />}
      variant="contained"
      color="inherit"
      href={`${getApiBase(true)}/api/divisions/${divisionId}/export${path}`}
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
