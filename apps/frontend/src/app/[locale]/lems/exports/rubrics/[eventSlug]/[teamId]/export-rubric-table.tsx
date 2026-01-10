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
    <Box>
      <Paper elevation={3} sx={{ borderRadius: 2, my: 2 }}>
        <Table
          sx={{
            tableLayout: 'fixed',
            '& thead': {
              backgroundColor: 'action.hover'
            },
            '& td, & th': {
              borderColor: 'divider'
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
                    fontSize: '1em',
                    py: '0.875em',
                    px: '0.5em',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Typography fontSize="1.4em" fontWeight={700}>
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
                      py: '0.75em',
                      px: '1.5em',
                      textAlign: 'start',
                      fontSize: '0.875em',
                      fontWeight: 500
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontSize="1em" fontWeight={700} component="span" flexShrink={0}>
                        {getSectionTitle(section.id)}
                      </Typography>
                      <Box sx={{ whiteSpace: 'pre' }}> - </Box>
                      <Typography sx={{ flex: 1, fontSize: '0.9em' }}>
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
                          align={levelText ? 'left' : 'center'}
                          sx={{
                            borderTop: '1px solid #000',
                            borderRight: '1px solid rgba(0,0,0,0.2)',
                            borderLeft: '1px solid rgba(0,0,0,0.2)',
                            borderBottom: 'none',
                            fontSize: '1em',
                            p: '0.75em',
                            pr: '0.5em',
                            pl: '0.25em',
                            backgroundColor: '#fff'
                          }}
                        >
                          <Stack
                            spacing={0.5}
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
                                  sx={{ fontSize: '1.5em' }}
                                />
                              }
                              label=""
                              sx={{
                                m: 0,
                                '.MuiFormControlLabel-label': { display: 'none' }
                              }}
                            />
                            {levelText && (
                              <Typography fontSize="0.875em" sx={{ pt: '0.25em' }}>
                                {levelText}
                              </Typography>
                            )}
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
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{
                    bgcolor: sectionBgColor,
                    py: '0.75em',
                    px: '1.5em',
                    textAlign: 'start',
                    fontSize: '0.875em',
                    fontWeight: 500
                  }}
                >
                  <Typography fontSize="1em" fontWeight={700}>
                    {getFeedbackTitle('feedback')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {feedback && (
              <>
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: '1em' }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography fontWeight={700} fontSize="0.9em">
                          {getFeedbackTitle('great-job')}
                        </Typography>
                        <Typography fontSize="0.85em">{feedback.greatJob || '-'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: '1em' }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography fontWeight={700} fontSize="0.9em">
                          {getFeedbackTitle('think-about')}
                        </Typography>
                        <Typography fontSize="0.85em">{feedback.thinkAbout || '-'}</Typography>
                      </Box>
                    </Stack>
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
