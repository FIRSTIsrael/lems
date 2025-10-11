import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { rubricSchemaColumns } from '@lems/season';

interface HeaderRowProps {
  columns: typeof rubricSchemaColumns;
  category: JudgingCategory;
  hideDescriptions?: boolean;
}

const colors: { [K in JudgingCategory]: string[] } = {
  'core-values': ['#FAECEA', '#F3D0C9', '#EBB3AA', '#E4928B'],
  'innovation-project': ['#E9ECF7', '#BDC6E4', '#90A3D2', '#5E82BF'],
  'robot-design': ['#EDF4EC', '#C6DDC5', '#99C69C', '#64AF75']
};

const HeaderRow: React.FC<HeaderRowProps> = ({
  columns,
  category: type,
  hideDescriptions = false
}) => {
  const getBorderRadius = (index: number, length: number): string | undefined => {
    if (index === 0) return '12px 0 0 0';
    if (index === length - 1) return '0 12px 0 0';
  };

  return (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={index}
          align="center"
          sx={{
            bgcolor: colors[type][index],
            border: '1.5px solid #000',
            boxSizing: 'border-box',
            borderRadius: getBorderRadius(index, columns.length),
            fontSize: '1em',
            py: '0.875em',
            px: '0.5em',
            top: theme => theme.mixins.toolbar.minHeight,
            '@media print': {
              fontSize: '1.4em',
              py: '0.5em',
              px: '0.25em',
              borderRadius: '0',
              bgcolor: colors[type][index],
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }
          }}
        >
          <Typography fontSize="1.4em" fontWeight={700}>
            {typeof column === 'object' ? column.title : column}
          </Typography>

          {typeof column === 'object' && column.description && !hideDescriptions && (
            <Typography fontSize="0.75em">{column.description}</Typography>
          )}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default HeaderRow;
