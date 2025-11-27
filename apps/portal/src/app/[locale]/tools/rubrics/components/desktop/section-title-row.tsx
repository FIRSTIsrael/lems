'use client';

import { TableRow, TableCell, Typography, Box, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { useRubricsTranslations } from '@lems/localization';

interface SectionTitleRowProps {
  sectionId: string;
  category: JudgingCategory;
}

const sectionColors: { [K in JudgingCategory]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

export const SectionTitleRow: React.FC<SectionTitleRowProps> = ({ sectionId, category }) => {
  const { getSectionTitle, getSectionDescription } = useRubricsTranslations(category);

  return (
    <TableRow>
      <TableCell
        sx={{
          bgcolor: sectionColors[category],
          py: '0.75em',
          px: '1.5em',
          textAlign: 'start',
          fontSize: '0.875em',
          fontWeight: 500,
          '@media print': {
            py: 0,
            px: '0.25em',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }
        }}
        colSpan={4}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize="1em" fontWeight={700} component="span" flexShrink={0}>
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
