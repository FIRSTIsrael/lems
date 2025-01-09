import Image from 'next/image';
import SignatureCanvas from 'react-signature-canvas';
import { Box, Stack, IconButton } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

interface ScoresheetSignatureProps {
  canvasRef: React.MutableRefObject<SignatureCanvas | null>;
  signature: string;
  allowEdit: boolean;
  allowReset: boolean;
  onUpdate: () => void;
}

const ScoresheetSignature: React.FC<ScoresheetSignatureProps> = ({
  canvasRef,
  signature,
  allowEdit,
  allowReset,
  onUpdate
}) => {
  const showResetButton = canvasRef.current && allowReset;

  if (!allowEdit) {
    return (
      <Image
        src={signature || '/assets/scoresheet/blank-signature.svg'}
        alt={`חתימת הקבוצה`}
        width={400}
        height={200}
        style={{ borderRadius: '8px', border: '1px solid #f1f1f1' }}
      />
    );
  }

  return (
    <Stack direction="row" spacing={2}>
      {showResetButton && (
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => {
              canvasRef.current?.clear();
              onUpdate();
            }}
          >
            <RestartAltRoundedIcon />
          </IconButton>
        </Box>
      )}
      <SignatureCanvas
        canvasProps={{
          width: 400,
          height: 200,
          style: { borderRadius: '8px', border: '1px solid #f1f1f1' }
        }}
        backgroundColor="#fff"
        ref={ref => {
          canvasRef.current = ref;
        }}
        onEnd={() => onUpdate()}
      />
    </Stack>
  );
};

export default ScoresheetSignature;
