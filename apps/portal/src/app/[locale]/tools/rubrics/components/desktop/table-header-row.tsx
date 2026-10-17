'use client';

import { TableRow, TableCell, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { getRubricColors, rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { useToolEdition } from '../../../hooks/use-tool-edition';

interface TableHeaderRowProps {
  category: JudgingCategory;
}

export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({ category }) => {
  const edition = useToolEdition();
  const { getColumnTitle } = useRubricsGeneralTranslations(edition);
  const colors = getRubricColors(edition, category).columns;

  return (
    <TableRow>
      {rubricColumns.map((column, index) => (
        <TableCell
          key={index}
          align="center"
          sx={{
            bgcolor: colors[index],
            boxSizing: 'border-box',
            fontSize: '1em',
            py: '0.875em',
            px: '0.5em',
            fontWeight: 700,
            '@media print': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }
          }}
        >
          <Typography
            sx={{
              fontSize: '1.4em',
              fontWeight: 700
            }}
          >
            {getColumnTitle(column)}
          </Typography>
        </TableCell>
      ))}
    </TableRow>
  );
};
