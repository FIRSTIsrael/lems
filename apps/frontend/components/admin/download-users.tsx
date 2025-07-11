import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Division } from '@lems/types';
import { getApiBase } from '../../lib/utils/fetch';
import { useTranslations } from 'next-intl';

interface DownloadUsersButtonProps extends ButtonProps {
  division: WithId<Division>;
}

const DownloadUsersButton: React.FC<DownloadUsersButtonProps> = ({ division, ...props }) => {
  const t = useTranslations('components:admin:download-users');
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
      {t('download-users')}
    </Button>
  );
};

export default DownloadUsersButton;
