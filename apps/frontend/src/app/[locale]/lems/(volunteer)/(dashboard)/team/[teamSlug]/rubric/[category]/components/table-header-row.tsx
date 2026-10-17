'use client';

import { TableRow, TableCell, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { getRubricColors, rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations } from '@lems/localization';
import { useEdition } from '../../../../../../hooks/use-edition';

interface TableHeaderRowProps {
  category: JudgingCategory;
}

export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({ category }) => {
  const edition = useEdition();
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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
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
