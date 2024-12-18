import { JudgingCategory, Rubric } from '@lems/types';
import Grid from '@mui/material/Grid2';
import {
  Box,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { rubricsSchemas } from '@lems/season';
import RubricRadioIcon from '../../judging/rubrics/rubric-radio-icon';
import HeaderRow from '../../judging/rubrics/header-row';
import TitleRow from '../../judging/rubrics/title-row';

interface RubricTableProps {
  rubric: Rubric<JudgingCategory>;
}

export const RubricTable: React.FC<RubricTableProps> = ({ rubric }) => {
  return (
    <Grid size={12}>
      <Box dir="rtl" sx={{ width: '115%', mt: 1, mb: -2, mr: -3, ml: -7 }}>
        <Table
          sx={{
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: '100%',
            transform: 'scale(0.8)',
            transformOrigin: 'top center',
            position: 'relative',
            '& .MuiTableCell-root': {
              padding: '3px 6px',
              fontSize: '0.85rem',
              lineHeight: 1.2,
              height: 'auto'
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              padding: '1em',
              fontSize: '1em'
            },
            '& .MuiTypography-root': {
              fontSize: '0.85rem',
              lineHeight: 1.2
            },
            '& .MuiTableHead-root .MuiTypography-root': {
              fontSize: '1em'
            },
            '& .MuiTableRow-root': {
              minHeight: 'unset',
              height: 'auto'
            }
          }}
        >
          <TableHead sx={{ border: '2px solid #000', p: '0.5rem 0.25rem' }}>
            <HeaderRow
              columns={rubricsSchemas[rubric.category].columns}
              category={rubric.category}
              hideDescriptions={rubric.category !== 'core-values'}
            />
          </TableHead>
          {rubricsSchemas[rubric.category].sections.map(section => (
            <TableBody key={section.title}>
              <TitleRow
                title={section.title}
                description={section.description}
                category={rubric.category}
              />
              {section.fields.map(field => {
                const labels = [field.label_1, field.label_2, field.label_3, field.label_4];
                const rubricValues = rubric.data?.values;
                const isCoreValuesField = field.isCoreValuesField ?? false;

                return (
                  <>
                    <TableRow>
                      {labels.map((label, index) => {
                        const cellValue = index + 1;
                        const isCellSelected = rubricValues?.[field.id]?.value === cellValue;
                        const comment = rubricValues?.[field.id]?.notes;

                        return (
                          <TableCell
                            key={label ? label + index : index}
                            align={label ? 'left' : 'center'}
                            sx={{
                              border: '2px solid #000',
                              fontSize: '0.7rem',
                              p: '0 0.5em',
                              backgroundColor: '#fff'
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                width: '100%',
                                minHeight: '2.5rem'
                              }}
                            >
                              <FormControlLabel
                                value={cellValue}
                                control={
                                  <Radio
                                    disableRipple
                                    checked={isCellSelected}
                                    icon={
                                      <RubricRadioIcon
                                        checked={false}
                                        isCoreValuesField={isCoreValuesField}
                                        sx={{
                                          fontSize: '1.7em',
                                          color: 'rgba(0,0,0,0.24)'
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <RubricRadioIcon
                                        checked={true}
                                        isCoreValuesField={isCoreValuesField}
                                        sx={{
                                          fontSize: '1.7em',
                                          color: '#0071e3'
                                        }}
                                      />
                                    }
                                  />
                                }
                                label=""
                                sx={{
                                  m: 0,
                                  '.MuiFormControlLabel-label': { display: 'none' }
                                }}
                              />
                              {isCellSelected && comment && index === 3 && (
                                <Typography
                                  component="span"
                                  fontSize="0.7rem"
                                  textAlign="left"
                                  sx={{
                                    ml: -1,
                                    color: 'text.secondary'
                                  }}
                                >
                                  נימוק: {comment}
                                </Typography>
                              )}
                              <Box sx={{ flex: 1 }}>{label}</Box>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          ))}
          {rubric.data?.values && rubric.category !== 'core-values' && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '2rem',
                color: 'text.secondary',
                whiteSpace: 'nowrap'
              }}
            >
              <RubricRadioIcon
                checked={false}
                isCoreValuesField={true}
                sx={{ fontSize: '1.2em', color: 'rgba(0,0,0,0.24)' }}
              />
              <Typography
                variant="caption"
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  color: 'black'
                }}
              >
                קריטריונים עם תיבת סימון זו מחשבים פעמיים בעת קביעת המועמדות לפרסים - גם להערכת
                הנושא הנ׳׳ל וגם להערכת ערכי הליבה
              </Typography>
            </Box>
          )}
        </Table>
      </Box>
    </Grid>
  );
};
