import { IconButton, Modal, Paper } from '@mui/material';
import CompareView, { CompareViewProps } from './compare-view';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface CompareModalProps extends CompareViewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CompareModal: React.FC<CompareModalProps> = props => {
  const { open, setOpen, ...compareViewProps } = props;

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
          bgcolor: '#eaeaec'
        }}
      >
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'fixed', mt: -2, ml: -1 }}>
          <CloseRounded />
        </IconButton>
        <CompareView {...compareViewProps} />
      </Paper>
    </Modal>
  );
};

export default CompareModal;
