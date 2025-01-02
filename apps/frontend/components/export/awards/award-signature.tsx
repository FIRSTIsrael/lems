import Image from 'next/image';
import { Box, Stack, Typography } from '@mui/material';

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
    <Stack alignItems="center">
      <Image alt={`חתימה של ${name}`} src={src} width={100} height={100} />
      <Box width={150} height={2} bgcolor="#000" mt={-2} mb={1.5}/>
      <Typography variant="h3" fontSize="1.35rem" fontWeight={600} align="center" gutterBottom>{name}</Typography>
      <Typography align="center">{role}</Typography>
      <Typography align="center">{organization}</Typography>
    </Stack>
  );
};

export default ExportAwardSignature;
