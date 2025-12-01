import { useRef } from 'react';
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

interface SoundTestDialogProps {
  open: boolean;
  setOpen: (newValue: boolean) => void;
}

const SoundTestDialog: React.FC<SoundTestDialogProps> = ({ open, setOpen }) => {
  const t = useTranslations('pages.judge.sound-test.dialog');
  const sounds = useRef([
    { key: 'start', audio: new Audio('/assets/sounds/judging/judging-start.wav') },
    { key: 'end', audio: new Audio('/assets/sounds/judging/judging-end.wav') },
    { key: 'transition', audio: new Audio('/assets/sounds/judging/judging-change.wav') }
  ]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="sound-test-title"
      aria-describedby="sound-test-description"
    >
      <DialogTitle id="sound-test-title">{t('title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-data-description">
          {t('description')}
        </DialogContentText>
        <Stack justifyContent="space-evenly" width="100%" direction="row" mt={2}>
          {sounds.current.map(({ key, audio }) => (
            <Stack key={key} alignItems="center">
              <IconButton
                onClick={() => audio.play()}
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
        <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoundTestDialog;
