import { AwardNames, DivisionWithEvent, SEASON_NAME, Team } from '@lems/types';
import { WithId } from 'mongodb';
import Image from 'next/image';
import { Stack, Typography, Box } from '@mui/material';
import { localizedAward, localizedAwardPlace } from '@lems/season';
import ExportAwardSignature from './award-signature';
import { localizeDivisionTitle } from '../../../localization/event';

// Duplicated code, move to some common folder
interface AwardToExport {
  name?: string;
  place?: number;
  isParticipation?: boolean;
}

interface ExportAwardContentProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  award: AwardToExport;
}

const ExportAwardContent: React.FC<ExportAwardContentProps> = ({ division, team, award }) => {
  let awardTitle: string;
  if (award.isParticipation) {
    awardTitle = 'שמחנו לפגוש אתכם!';
  } else {
    awardTitle = `פרס ${localizedAward[award.name as AwardNames].name} ${award.place ? `- מקום ${localizedAwardPlace[award.place]}` : ''}`;
  }

  return (
    <Stack alignItems="center" mt={6}>
      <Stack direction="row" spacing={5} mb={3}>
        <Image alt="" src="/assets/awards/FLL_CHALLENGE_LOGO.svg" width={150} height={100} />
        <Image alt="" src="/assets/awards/SUBMERGED_LOGO.svg" width={100} height={100} />
      </Stack>
      <Typography variant="h1" align="center" fontSize="2.6rem">
        {awardTitle}
      </Typography>
      <Typography align="center" fontSize="1.75rem" mb={3.5}>
        {award.isParticipation ? '' : 'מוענק לקבוצה'}
      </Typography>
      <Typography align="center" variant="h2" fontSize="2.25rem" mb={0.5}>
        {`${team.name} #${team.number}`}
      </Typography>
      <Box width="500px" height="2px" bgcolor="#000" />
      <Typography variant="h2" align="center" fontSize="1.25rem" mt={1} gutterBottom>
        {localizeDivisionTitle(division)}
      </Typography>
      <Typography variant="h2" align="center" fontSize="1.15rem" mb={3}>
        {`עונת ${SEASON_NAME}`}
      </Typography>
      <Stack direction="row" spacing={6} width="100%" alignItems="center" justifyContent="center">
        <ExportAwardSignature
          src="/assets/awards/SIGNATURE_GILA.svg"
          name="גילה קוסן"
          role={`מנכ"לית`}
          organization="*FIRST* ישראל"
        />
        <ExportAwardSignature
          src="/assets/awards/SIGNATURE_GAL.svg"
          name="גל אברהמוף"
          role="מנהלת תוכנית"
          organization="*FIRST* LEGO League Challenge"
        />
      </Stack>
      <Stack direction="row" justifyContent="space-between" spacing={2} mt={5}>
        <Image alt="" src="/assets/awards/TECHNION_LOGO.svg" width={175} height={100} />
        <Image alt="" src="/assets/awards/FIRST_DIVE_Logo.svg" width={175} height={100} />
        <Image alt="" src="/assets/awards/FIRST_ISRAEL_Logo.svg" width={175} height={100} />
      </Stack>
    </Stack>
  );
};

export default ExportAwardContent;
