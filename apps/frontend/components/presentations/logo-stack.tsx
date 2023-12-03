import Image from 'next/image';
import { Stack } from '@mui/material';

const LogoStack: React.FC = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-evenly"
      position="absolute"
      bottom={0}
      left={0}
      width="100%"
      bgcolor="#f7f8f9"
      height={100}
    >
      <Image
        src="/assets/audience-display/sponsors/first-israel-horizontal.svg"
        alt="תמונת ספונסר"
        width={0}
        height={0}
        style={{
          objectFit: 'contain',
          padding: 16,
          width: 'auto',
          height: '100%',
          display: 'inline-block'
        }}
      />
      <Image
        src="/assets/audience-display/sponsors/technion-horizontal.svg"
        alt="תמונת ספונסר"
        width={0}
        height={0}
        style={{
          objectFit: 'contain',
          padding: 16,
          width: 'auto',
          height: '100%',
          display: 'inline-block'
        }}
      />
      <Image
        src="/assets/audience-display/sponsors/fllc-horizontal.svg"
        alt="תמונת ספונסר"
        width={0}
        height={0}
        style={{
          objectFit: 'contain',
          padding: 16,
          width: 'auto',
          height: '100%',
          display: 'inline-block'
        }}
      />
      <Image
        src="/assets/audience-display/season-logo.svg"
        alt="תמונת ספונסר"
        width={0}
        height={0}
        style={{
          objectFit: 'contain',
          padding: 16,
          width: 'auto',
          height: '100%',
          display: 'inline-block'
        }}
      />
    </Stack>
  );
};

export default LogoStack;
