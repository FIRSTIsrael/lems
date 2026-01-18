import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { useTranslations } from 'next-intl';
import { useJudgingSounds } from '@lems/shared';

interface SoundTestDialogProps {
  open: boolean;
  setOpen: (newValue: boolean) => void;
}

export const SoundTestDialog: React.FC<SoundTestDialogProps> = ({ open, setOpen }) => {
  const t = useTranslations('pages.judge.sound-test.dialog');
  const { playSound } = useJudgingSounds();

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="sound-test-title"
      aria-describedby="sound-test-description"
    >
      <DialogTitle id="sound-test-title">{t('title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-data-description">{t('description')}</DialogContentText>
        <Stack justifyContent="space-evenly" width="100%" direction="row" mt={2}>
          {['start', 'change', 'end'].map(key => (
            <Stack key={key} alignItems="center">
              <IconButton
                onClick={() => playSound(key as 'start' | 'change' | 'end')}
                sx={{ width: 36, height: 36 }}
                color="primary"
              >
                <VolumeUpRoundedIcon />
              </IconButton>
              <Typography fontSize="0.75rem" color="textSecondary" textAlign="center">
                {t(`sounds.${key}`)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
