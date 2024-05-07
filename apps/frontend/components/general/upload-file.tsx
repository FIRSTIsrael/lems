import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  Stack,
  Typography
} from '@mui/material';
import ImportIcon from '@mui/icons-material/UploadRounded';
import FileIcon from '@mui/icons-material/AttachFile';
import { apiFetch } from '../../lib/utils/fetch';
import { useSnackbar } from 'notistack';

interface UploadFileButtonProps extends ButtonProps {
  urlPath: string;
  displayName: string;
  extension?: string;
  requestData?: object;
}

const UploadFileButton: React.FC<UploadFileButtonProps> = ({
  urlPath,
  displayName,
  extension,
  requestData,
  ...props
}) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setIsError(false);
    setIsProcessing(true);
    const formData = new FormData();
    if (requestData) {
      Object.entries(requestData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    formData.append('file', file);
    apiFetch(urlPath, {
      method: 'POST',
      body: formData,
      headers: { 'x-lems-csrf-enabled': 'true' }
    })
      .then(res => {
        if (res?.ok) {
          enqueueSnackbar(`קובץ ${displayName} עודכן בהצלחה.`, { variant: 'success' });
          setDialogOpen(false);
          setFile(null);
          router.reload();
        } else {
          throw new Error('HTTP-ERROR');
        }
      })
      .catch(e => setIsError(true))
      .finally(() => setIsProcessing(false));
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<ImportIcon />}
        onClick={() => setDialogOpen(true)}
        {...props}
      >
        {`העלאת ${displayName}`}
      </Button>
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          if (!isProcessing) {
            setDialogOpen(false);
          }
        }}
      >
        <DialogTitle>{`העלאת ${displayName}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            בחרו קובץ {extension && `בפורמט ${extension}`} להעלאה
          </DialogContentText>
          <Stack flexDirection="column" alignItems="center" mt={2} mb={1}>
            <label htmlFor="upload-schedule-button">
              <Input
                id="upload-schedule-button"
                type="file"
                slotProps={{
                  input: {
                    accept: extension,
                    multiple: true
                  }
                }}
                sx={{ display: 'none' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target?.files?.[0];
                  if (file) {
                    setFile(file);
                    setIsError(false);
                  }
                }}
                disabled={isProcessing}
              />
              <Button
                variant="outlined"
                startIcon={<FileIcon />}
                color="inherit"
                component="span"
                disabled={isProcessing}
              >
                {file ? <span dir="ltr">{file.name}</span> : 'בחירת קובץ'}
              </Button>
            </label>

            {(isProcessing || isError) && (
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={2}>
                {isProcessing && <CircularProgress sx={{ my: 1 }} size="1.5rem" />}
                <Typography
                  fontWeight={500}
                  fontSize="0.875rem"
                  sx={{ color: isError ? '#ef4444' : undefined }}
                >
                  {isProcessing
                    ? 'רק רגע, אנו מעבדים את הקובץ'
                    : isError
                      ? `שגיאה בעדכון קובץ ${displayName}.`
                      : null}
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isProcessing}>
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            disabled={!file || isProcessing}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadFileButton;
