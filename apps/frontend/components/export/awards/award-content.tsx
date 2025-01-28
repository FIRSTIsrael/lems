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
    awardTitle = `פרס ${localizedAward[award.name as AwardNames].name}`;
    if (award.place) {
      awardTitle += ` ${award.place ? `- מקום ${localizedAwardPlace[award.place]}` : ''}`;
    }
  }

  return (
    <Stack alignItems="center" mt={6}>
      <Typography align="center" fontSize="3.2rem" fontWeight={700}>
        {`${awardTitle}`}
      </Typography>
      <Typography align="center" fontSize="1.75rem" mb={3.5} fontWeight={400}>
        {award.isParticipation ? '' : 'מוענק לקבוצה'}
      </Typography>
      <Typography align="center" variant="h2" fontSize="2.25rem" mb={0.5}>
        {`${team.name} #${team.number}`}
      </Typography>
      <Box
        width={500}
        height={0}
        sx={{
          borderBottom: '2px solid rgb(0,0,0)',
          marginBottom: '2px'
        }}
      />
      <Typography align="center" fontSize="1.25rem" mt={1} gutterBottom>
        {localizeDivisionTitle(division)}
      </Typography>
      <Typography align="center" fontSize="1.15rem" mb={3}>
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
      <Stack direction="row" justifyContent="space-between" spacing={2} mt={8}>
        <Image alt="" src="/assets/awards/TECHNION_LOGO.svg" width={200} height={125} />
        <Image alt="" src="/assets/awards/FIRST_DIVE_Logo.svg" width={200} height={125} />
        <Image alt="" src="/assets/awards/FIRST_ISRAEL_Logo.svg" width={200} height={125} />
      </Stack>
    </Stack>
  );
};

export default ExportAwardContent;
