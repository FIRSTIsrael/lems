import { DivisionWithEvent, Team } from '@lems/types';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Stack, Typography } from '@mui/material';
import ExportAwardSignature from './award-signature';

interface ExportAwardContentProps {}

const ExportAwardContent: React.FC<ExportAwardContentProps> = ({}) => {
  return (
    <Stack alignItems="center" mt={4}>
      <Stack direction="row" spacing={5} mb={3}>
        <Image alt="" src="/assets/awards/FLL_CHALLENGE_LOGO.svg" width={150} height={100} />
        <Image alt="" src="/assets/awards/SUBMERGED_LOGO.svg" width={100} height={100} />
      </Stack>
      <Typography variant="h1" align="center" fontSize="3rem">
        פרס האליפות - מקום ראשון
      </Typography>
      <Typography align="center" fontSize="1.5rem" mb={3}>
        מוענק לקבוצה
      </Typography>
      <Typography align="center" variant="h2" fontSize="2.5rem">
        קבוצה 966 - Nyan Cats
      </Typography>
      <Typography variant="h1" align="center">
        תחרות מוקדמות #5 - עונת SUBMERGED
      </Typography>
      <Stack direction="row" spacing={2}>
        <ExportAwardSignature
          src="/assets/awards/SIGNATURE_GILA.svg"
          name="גילה קוסן"
          role={`מנכ"לית`}
          organization="FIRST ישראל"
        />
        <ExportAwardSignature
          src="/assets/awards/SIGNATURE_GAL.svg"
          name="גל אברהמוף"
          role="מנהלת תוכנית"
          organization="FIRST LEGO League Challenge"
        />
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Image alt="" src="/assets/awards/TECHNION_LOGO.svg" width={100} height={100} />
        <Image alt="" src="/assets/awards/FIRST_DIVE_Logo.svg" width={100} height={100} />
        <Image alt="" src="/assets/awards/FIRST_ISRAEL_Logo.svg" width={100} height={100} />
      </Stack>
    </Stack>
  );
};

export default ExportAwardContent;
