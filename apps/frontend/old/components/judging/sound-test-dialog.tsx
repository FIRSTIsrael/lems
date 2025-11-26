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

interface SoundTestDialogProps {
  open: boolean;
  setOpen: (newValue: boolean) => void;
}

const SoundTestDialog: React.FC<SoundTestDialogProps> = ({ open, setOpen }) => {
  const sounds = useRef({
    'תחילת מפגש': new Audio('/assets/sounds/judging/judging-start.wav'),
    'סוף מפגש': new Audio('/assets/sounds/judging/judging-end.wav'),
    'מעבר שלב': new Audio('/assets/sounds/judging/judging-change.wav')
  });
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="sound-test-title"
      aria-describedby="sound-test-description"
    >
      <DialogTitle id="sound-test-title">בדיקת שמע</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-data-description">
          במהלך חדר השיפוט יופעלו מספר חיוויים שמטרתם לעדכן את הקבוצה על מעבר בשלבי ההצגה שלהם. אנא
          בדקו שקטעי השמע פועלים לפני כניסת הקבוצות.
        </DialogContentText>
        <Stack justifyContent="space-evenly" width="100%" direction="row" mt={2}>
          {Object.entries(sounds.current).map(([name, audio]) => (
            <Stack key={name} alignItems="center">
              <IconButton
                onClick={() => audio.play()}
                sx={{ width: 36, height: 36 }}
                color="primary"
              >
                <VolumeUpRoundedIcon />
              </IconButton>
              <Typography fontSize="0.75rem" color="textSecondary" textAlign="center">
                {name}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>ביטול</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoundTestDialog;
