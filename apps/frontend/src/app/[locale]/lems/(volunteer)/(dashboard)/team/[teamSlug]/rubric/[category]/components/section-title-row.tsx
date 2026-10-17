'use client';

import { TableRow, TableCell, Typography, Box, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { getRubricColors } from '@lems/shared/rubrics';
import { useEdition } from '../../../../../../hooks/use-edition';

interface SectionTitleRowProps {
  sectionId: string;
  category: JudgingCategory;
}

export const SectionTitleRow: React.FC<SectionTitleRowProps> = ({ sectionId, category }) => {
  const edition = useEdition();
  const { getSectionTitle, getSectionDescription } = useRubricsTranslations(category, edition);

  return (
    <TableRow>
      <TableCell
        sx={{
          bgcolor: getRubricColors(edition, category).section,
          py: '0.75em',
          px: '1.5em',
          textAlign: 'start',
          fontSize: '0.875em',
          fontWeight: 500
        }}
        colSpan={4}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center'
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '1em',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {getSectionTitle(sectionId)}
          </Typography>
          <Box sx={{ whiteSpace: 'pre' }}> - </Box>
          <Typography sx={{ flex: 1, fontSize: '0.9em' }}>
            {getSectionDescription(sectionId)}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
};
