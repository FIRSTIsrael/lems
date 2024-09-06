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
      <Paper>
        <CompareView {...compareViewProps} />
      </Paper>
    </Modal>
  );
};

export default CompareModal;
