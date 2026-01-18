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
  Box
} from '@mui/material';
import { CircleOutlined, TaskAltRounded } from '@mui/icons-material';
import { CoreValuesFieldCheckedIcon, CoreValuesFieldUncheckedIcon } from '@lems/shared/icons';
import { JudgingCategory } from '@lems/types/judging';
import { RubricsSchema, rubricColumns } from '@lems/shared/rubrics';
import { useRubricsGeneralTranslations, useRubricsTranslations } from '@lems/localization';
import { useTranslations } from 'next-intl';

interface ExportRubricTableProps {
  sections: RubricsSchema[JudgingCategory]['sections'];
  category: JudgingCategory;
  scores: Record<string, number | null>;
  notes?: Record<string, string>;
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
  notes,
  feedback
}) => {
  const { getColumnTitle } = useRubricsGeneralTranslations();
  const { getSectionTitle, getSectionDescription, getFieldLevel } =
    useRubricsTranslations(category);
  const t = useTranslations('pages.rubric');
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
          <TableHead>
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
                {section.fields.map(field => {
                  const hasNotes = scores[field.id] === 4 && Boolean(notes?.[field.id]);

                  return (
                    <React.Fragment key={field.id}>
                      <TableRow>
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
                                {field.coreValues ? (
                                  isChecked ? (
                                    <CoreValuesFieldCheckedIcon
                                      sx={{
                                        color: 'primary.main',
                                        fill: 'primary.main',
                                        fontSize: '1.5em'
                                      }}
                                    />
                                  ) : (
                                    <CoreValuesFieldUncheckedIcon
                                      sx={{
                                        color: 'action.active',
                                        fill: 'action.active',
                                        fontSize: '1.5em'
                                      }}
                                    />
                                  )
                                ) : isChecked ? (
                                  <TaskAltRounded
                                    sx={{
                                      color: 'primary.main',
                                      fontSize: '1.5em'
                                    }}
                                  />
                                ) : (
                                  <CircleOutlined
                                    sx={{
                                      color: 'action.active',
                                      fontSize: '1.5em'
                                    }}
                                  />
                                )}
                                {levelText && (
                                  <Typography fontSize="0.85em">{levelText}</Typography>
                                )}
                              </Stack>
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {hasNotes && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{
                              borderTop: '1px solid rgba(0,0,0,0.2)',
                              borderRight: '1px solid rgba(0,0,0,0.2)',
                              borderLeft: '1px solid rgba(0,0,0,0.2)',
                              borderBottom: 'none',
                              backgroundColor: 'rgba(0,0,0,0.03)',
                              py: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  lineHeight: 1.4375,
                                  mr: 0.75,
                                  color: 'rgba(0,0,0,0.6)',
                                  fontSize: '0.85em',
                                  '@media print': {
                                    fontSize: '0.8em'
                                  }
                                }}
                              >
                                {t('field-notes-label')}:
                              </Typography>
                              <Typography
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  fontSize: '0.8em',
                                  lineHeight: 1.25,
                                  '@media print': {
                                    fontSize: '0.75em'
                                  }
                                }}
                              >
                                {notes?.[field.id]}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
            {feedback && (
              <>
                <TableRow></TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
