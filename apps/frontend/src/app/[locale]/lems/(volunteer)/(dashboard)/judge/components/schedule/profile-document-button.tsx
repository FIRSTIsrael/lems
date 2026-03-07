'use client';

import { IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';

interface ProfileDocumentButtonProps {
  profileDocumentUrl?: string | null;
}

export const ProfileDocumentButton: React.FC<ProfileDocumentButtonProps> = ({
  profileDocumentUrl
}) => {
  const t = useTranslations('pages.judge.schedule');

  const handleOpenDocument = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!profileDocumentUrl) return;

    try {
      window.open(profileDocumentUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Fail silently
    }
  };

  const isDisabled = !profileDocumentUrl;

  return (
    <Tooltip title={t('profile-document-tooltip')} placement="top">
      <span>
        <IconButton
          size="small"
          onClick={handleOpenDocument}
          disabled={isDisabled}
          sx={{
            bgcolor: isDisabled ? 'action.disabledBackground' : 'primary.main',
            color: isDisabled ? 'action.disabled' : 'primary.contrastText',
            '&:hover:not(:disabled)': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};
