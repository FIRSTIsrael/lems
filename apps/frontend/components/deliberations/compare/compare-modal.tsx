import { Modal, Paper } from '@mui/material';
import CompareView, { CompareViewProps } from './compare-view';

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
        <CompareView {...compareViewProps} />
      </Paper>
    </Modal>
  );
};

export default CompareModal;
