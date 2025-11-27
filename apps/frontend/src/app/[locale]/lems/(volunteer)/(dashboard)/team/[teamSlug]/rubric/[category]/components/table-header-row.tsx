'use client';

import { TableRow, TableCell, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations } from '@lems/localization';

interface TableHeaderRowProps {
  category: JudgingCategory;
}

const categoryColors: { [K in JudgingCategory]: string[] } = {
  'core-values': ['#FAECEA', '#F3D0C9', '#EBB3AA', '#E4928B'],
  'innovation-project': ['#E9ECF7', '#BDC6E4', '#90A3D2', '#5E82BF'],
  'robot-design': ['#EDF4EC', '#C6DDC5', '#99C69C', '#64AF75']
};

export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({ category }) => {
  const { getColumnTitle } = useRubricsGeneralTranslations();

  const colors = categoryColors[category];

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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            '@media print': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              position: 'relative',
              top: 'auto'
            }
          }}
        >
          <Typography fontSize="1.4em" fontWeight={700}>
            {getColumnTitle(column)}
          </Typography>
        </TableCell>
      ))}
    </TableRow>
  );
};
