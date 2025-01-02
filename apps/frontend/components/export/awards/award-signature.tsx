import Image from 'next/image';
import { Stack, Typography } from '@mui/material';

interface ExportAwardSignatureProps {
  src: string;
  name: string;
  role: string;
  organization?: string;
}

const ExportAwardSignature: React.FC<ExportAwardSignatureProps> = ({
  src,
  name,
  role,
  organization
}) => {
  return (
    <Stack>
      <Image alt={`חתימה של ${name}`} src={src} width={100} height={100} />
      <Typography>{name}</Typography>
      <Typography>{role}</Typography>
      <Typography>{organization}</Typography>
    </Stack>
  );
};

export default ExportAwardSignature;
