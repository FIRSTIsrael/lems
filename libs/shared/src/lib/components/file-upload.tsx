'use client';

import { Box, Typography, Button, Input } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface FileUploadProps {
  label: string;
  /** File types to accept (e.g., '.svg,image/svg+xml' or '.pdf,.doc,.docx') */
  accept: string;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  selectedFile,
  setSelectedFile,
  description,
  disabled = false,
  placeholder = 'Choose File',
  multiple = false
}) => {
  const inputId = `file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    // Reset input so next selection doesn't include previous files
    event.target.value = '';
  };

  const getDisplayText = () => {
    if (selectedFile) {
      return selectedFile.name;
    }
    return placeholder;
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
        {description && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({description})
          </Typography>
        )}
      </Typography>

      <label htmlFor={inputId}>
        <Input
          id={inputId}
          type="file"
          slotProps={{
            input: {
              accept,
              multiple,
              style: { display: 'none' }
            }
          }}
          onChange={handleFileChange}
          disabled={disabled}
        />

        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          component="span"
          disabled={disabled}
          sx={{ width: '100%' }}
        >
          {getDisplayText()}
        </Button>
      </label>
    </Box>
  );
};
