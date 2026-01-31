import { useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface MediaUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function MediaUploadButton({ onFileSelect, disabled = false }: MediaUploadButtonProps) {
  const t = useTranslations('pages.faqs.editor.toolbar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Tooltip title={t('media')}>
        <span>
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ImageIcon />
          </IconButton>
        </span>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
