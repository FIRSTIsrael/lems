'use client';

import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  Paper,
  TableRow,
  TableCell,
  Typography,
  Stack,
  Box,
  FormControlLabel,
  Radio
} from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricsSchema, rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations, useRubricsTranslations } from '@lems/localization';

interface ExportRubricTableProps {
  sections: RubricsSchema[JudgingCategory]['sections'];
  category: JudgingCategory;
  scores: Record<string, number | null>;
  feedback?: { greatJob: string; thinkAbout: string };
}

const categoryColors: { [K in JudgingCategory]: string[] } = {
  'core-values': ['#FAECEA', '#F3D0C9', '#EBB3AA', '#E4928B'],
  'innovation-project': ['#E9ECF7', '#BDC6E4', '#90A3D2', '#5E82BF'],
  'robot-design': ['#EDF4EC', '#C6DDC5', '#99C69C', '#64AF75']
};

const sectionColors: { [K in JudgingCategory]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

export const ExportRubricTable: React.FC<ExportRubricTableProps> = ({
  sections,
  category,
  scores,
  feedback
}) => {
  const { getColumnTitle, getFeedbackTitle } = useRubricsGeneralTranslations();
  const { getSectionTitle, getSectionDescription, getFieldLevel } =
    useRubricsTranslations(category);
  const colors = categoryColors[category];
  const sectionBgColor = sectionColors[category];

  return (
    <Box
      sx={{
        '@media print': {
          transform: 'scale(0.85)',
          transformOrigin: 'top center',
          width: '100%'
        }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          my: 2,
          '@media print': { boxShadow: 'none', borderRadius: 0, my: 0 }
        }}
      >
        <Table
          sx={{
            tableLayout: 'fixed',
            border: '2px solid #000',
            '& thead': {
              backgroundColor: 'action.hover'
            },
            '& td, & th': {
              borderColor: '#000',
              borderWidth: '0.3px',
              borderStyle: 'solid',
              '@media print': {
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }
            },
            '@media print': {
              '& tbody tr': {
                pageBreakInside: 'avoid'
              }
            }
          }}
        >
          <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <TableRow>
              {rubricColumns.map((column, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    bgcolor: colors[index],
                    boxSizing: 'border-box',
                    fontSize: '0.8em',
                    py: '0.6em',
                    px: '0.35em',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Typography fontSize="1.3em" fontWeight={700}>
                    {getColumnTitle(column)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sections.map(section => (
              <React.Fragment key={section.id}>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{
                      bgcolor: sectionBgColor,
                      py: '0.5em',
                      px: '0.85em',
                      textAlign: 'start',
                      fontSize: '0.75em',
                      fontWeight: 500
                    }}
                  >
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <Typography fontSize="1em" fontWeight={700} component="span" flexShrink={0}>
                        {getSectionTitle(section.id)}
                      </Typography>
                      <Box sx={{ whiteSpace: 'pre' }}> - </Box>
                      <Typography sx={{ flex: 1, fontSize: '0.95em' }}>
                        {getSectionDescription(section.id)}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                {section.fields.map(field => (
                  <TableRow key={field.id}>
                    {rubricColumns.map((level, levelIndex) => {
                      const cellValue = (levelIndex + 1) as 1 | 2 | 3 | 4;
                      const isChecked = scores[field.id] === cellValue;
                      const levelText =
                        level === 'exceeds' ? null : getFieldLevel(section.id, field.id, level);
                      return (
                        <TableCell
                          key={level}
                          align="left"
                          sx={{
                            borderTop: '1px solid #000',
                            borderRight: '1px solid rgba(0,0,0,0.2)',
                            borderLeft: '1px solid rgba(0,0,0,0.2)',
                            borderBottom: 'none',
                            fontSize: '0.75em',
                            p: '0.4em',
                            pr: '0.3em',
                            pl: '0.25em',
                            backgroundColor: '#fff',
                            verticalAlign: 'middle'
                          }}
                        >
                          <Stack
                            spacing={0.3}
                            direction="row"
                            alignItems={levelText ? 'flex-start' : 'center'}
                            justifyContent={levelText ? 'flex-start' : 'center'}
                          >
                            <FormControlLabel
                              value={cellValue}
                              control={
                                <Radio
                                  disableRipple
                                  checked={isChecked}
                                  sx={{ fontSize: '1.1em' }}
                                />
                              }
                              label=""
                              sx={{
                                m: 0,
                                '.MuiFormControlLabel-label': { display: 'none' }
                              }}
                            />
                            {levelText && <Typography fontSize="0.85em">{levelText}</Typography>}
                          </Stack>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {/* Feedback Row */}
            {feedback && (
              <>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{
                      bgcolor: sectionBgColor,
                      py: '0.4em',
                      px: '0.85em',
                      borderRight: '1px solid #000',
                      textAlign: 'left',
                      fontSize: '0.85em',
                      fontWeight: 500
                    }}
                  >
                    <Typography fontSize="0.9em" fontWeight={700}>
                      {getFeedbackTitle('great-job')}
                    </Typography>
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    sx={{
                      bgcolor: sectionBgColor,
                      py: '0.4em',
                      px: '0.85em',
                      textAlign: 'left',
                      fontSize: '0.85em',
                      fontWeight: 500
                    }}
                  >
                    <Typography fontSize="0.9em" fontWeight={700}>
                      {getFeedbackTitle('think-about')}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{
                      p: '0.5em',
                      borderRight: '1px solid #000',
                      textAlign: 'left'
                    }}
                  >
                    <Typography fontSize="0.85em">{feedback.greatJob || '-'}</Typography>
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    sx={{
                      p: '0.5em',
                      textAlign: 'left'
                    }}
                  >
                    <Typography fontSize="0.85em">{feedback.thinkAbout || '-'}</Typography>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
