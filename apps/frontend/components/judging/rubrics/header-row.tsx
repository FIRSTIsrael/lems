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
  return (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={index}
          align="center"
          sx={{
            bgcolor: colors[type][index],
            border: '1px solid #000',
            fontSize: '1em',
            py: '0.875em',
            px: '0.5em',
            top: theme => theme.mixins.toolbar.minHeight,
            '@media print': {
              position: 'inherit',
              top: 'unset'
            }
          }}
        >
          <Typography fontSize="1em" fontWeight={700}>
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
