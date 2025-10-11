import { useMemo } from 'react';
import dayjs from 'dayjs';
import { IconButton, LinearProgress, Modal, Paper, Box } from '@mui/material';
import CompareView, { CompareViewProps } from './compare-view';
import CloseRounded from '@mui/icons-material/CloseRounded';
import useCountdown from '../../../hooks/time/use-countdown';

interface CompareModalProps extends CompareViewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CompareModal: React.FC<CompareModalProps> = props => {
  const { open, setOpen, ...compareViewProps } = props;

  const TIMER_LENGTH_SECONDS = 90;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const targetDate = useMemo(() => dayjs().add(TIMER_LENGTH_SECONDS, 'seconds').toDate(), [open]);
  const [, , minutes, seconds] = useCountdown(targetDate);
  const time = minutes * 60 + seconds;

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          px: 2,
          py: 3,
          width: '75%',
          bgcolor: '#eaeaec',
          height: '80%'
        }}
      >
        <LinearProgress
          variant="determinate"
          value={time <= 0 ? 100 : (time / TIMER_LENGTH_SECONDS) * 100}
          color={time <= 0 ? 'error' : 'primary'}
          sx={{
            height: 16,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            mx: -2,
            mt: -3
          }}
        />
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'fixed', ml: -1 }}>
          <CloseRounded />
        </IconButton>
        <div style={{ marginBottom: 12 }} />
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
          <CompareView {...compareViewProps} />
        </Box>
      </Paper>
    </Modal>
  );
};

export default CompareModal;
