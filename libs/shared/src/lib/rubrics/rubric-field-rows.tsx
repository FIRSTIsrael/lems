'use client';

import React from 'react';
import { TableRow, TableCell, Typography, Stack, type SxProps, type Theme } from '@mui/material';
import { rubricColumns } from './rubrics';

export type RubricLevel = (typeof rubricColumns)[number];
export type RubricCellValue = 1 | 2 | 3 | 4;

interface RubricCriterionRowProps {
  criterion: string;
  id?: string;
  sx?: SxProps<Theme>;
}

/** Full-width criterion text shown above the level cells in the 'criteria' rubric layout. */
export const RubricCriterionRow: React.FC<RubricCriterionRowProps> = ({ criterion, id, sx }) => (
  <TableRow id={id}>
    <TableCell
      colSpan={rubricColumns.length}
      sx={[
        {
          borderTop: '1px solid #000',
          borderBottom: 'none',
          backgroundColor: '#fff',
          px: '1em',
          pt: '0.75em',
          pb: 0
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Typography sx={{ fontSize: '0.95em', fontWeight: 500 }}>{criterion}</Typography>
    </TableCell>
  </TableRow>
);

interface RubricFieldRowsProps {
  /** Criterion text for the 'criteria' layout; omit for the per-level 'levels' layout. */
  criterion?: string;
  /** Level description for a cell, or null for an unlabeled cell. Ignored in the 'criteria' layout. */
  getLevelLabel: (level: RubricLevel) => string | null;
  /** The interactive control (e.g. radio button) for a level cell. */
  renderControl: (cellValue: RubricCellValue, level: RubricLevel) => React.ReactNode;
  /** DOM id placed on the field's first row, used for scrolling to a field. */
  id?: string;
  cellSx?: SxProps<Theme>;
}

/**
 * The editable rows of a single rubric field: an optional criterion row followed by one
 * cell per level. Shared by the LEMS rubric and the portal practice rubric.
 */
export const RubricFieldRows: React.FC<RubricFieldRowsProps> = ({
  criterion,
  getLevelLabel,
  renderControl,
  id,
  cellSx
}) => {
  const isCriteria = criterion !== undefined;

  return (
    <>
      {isCriteria && <RubricCriterionRow criterion={criterion} id={id} />}
      <TableRow id={isCriteria ? undefined : id}>
        {rubricColumns.map((level, levelIndex) => {
          const cellValue = (levelIndex + 1) as RubricCellValue;
          const label = isCriteria || level === 'exceeds' ? null : getLevelLabel(level);

          return (
            <TableCell
              key={level}
              align={label ? 'left' : 'center'}
              sx={[
                {
                  borderTop: isCriteria ? 'none' : '1px solid #000',
                  borderRight: '1px solid rgba(0,0,0,0.2)',
                  borderLeft: '1px solid rgba(0,0,0,0.2)',
                  borderBottom: 'none',
                  fontSize: '1em',
                  p: '0.75em',
                  pr: '0.5em',
                  pl: '0.25em',
                  backgroundColor: '#fff'
                },
                ...(Array.isArray(cellSx) ? cellSx : [cellSx])
              ]}
            >
              <Stack
                spacing={0.5}
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: label ? 'flex-start' : 'center'
                }}
              >
                {renderControl(cellValue, level)}
                {label && (
                  <Typography sx={{ fontSize: '0.875em', pt: '0.25em' }}>{label}</Typography>
                )}
              </Stack>
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
};
