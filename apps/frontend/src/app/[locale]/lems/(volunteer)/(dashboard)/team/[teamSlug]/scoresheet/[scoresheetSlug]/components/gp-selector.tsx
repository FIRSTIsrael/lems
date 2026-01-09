'use client';

import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import {
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Box,
  useTheme
} from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import { useEvent } from '../../../../../../components/event-context';
import { useScoresheet } from '../scoresheet-context';
import { UPDATE_SCORESHEET_GP_MUTATION } from '../graphql';
import { UPDATE_SCORESHEET_STATUS_MUTATION } from '../graphql/mutations/status';

interface GPSelectorProps {
  disabled?: boolean;
}

const columns = [
  { value: 2, color: '#F3D0C9' },
  { value: 3, color: '#EBB3AA' },
  { value: 4, color: '#E4928B' }
];

export const GPSelector: React.FC<GPSelectorProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.scoresheet.gp-selector');
  const theme = useTheme();
  const { currentDivision } = useEvent();
  const { scoresheet } = useScoresheet();
  const [updateGP] = useMutation(UPDATE_SCORESHEET_GP_MUTATION);
  const [updateStatus] = useMutation(UPDATE_SCORESHEET_STATUS_MUTATION);
  const [localNotes, setLocalNotes] = useState(scoresheet.data?.gp?.notes || '');

  const value = scoresheet.data?.gp?.value;
  const notes = scoresheet.data?.gp?.notes || '';

  const handleGPValueChange = (newValue: number) => {
    updateGP({
      variables: {
        divisionId: currentDivision.id,
        scoresheetId: scoresheet.id,
        value: newValue,
        notes: notes
      }
    });
  };

  const handleNotesBlur = () => {
    updateGP({
      variables: {
        divisionId: currentDivision.id,
        scoresheetId: scoresheet.id,
        value: value,
        notes: localNotes
      }
    });
  };

  const isFormValid = () => {
    if (!value) return false;
    if ((value === 2 || value === 4) && !localNotes.trim()) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;
    updateStatus({
      variables: {
        divisionId: currentDivision.id,
        scoresheetId: scoresheet.id,
        status: 'submitted'
      }
    });
  };

  return (
    <Paper sx={{ p: 4, mt: 2, borderRadius: 2 }}>
      <Typography variant="h2" fontSize="1.5rem" fontWeight={500} pb={4} textAlign="center">
        {t('title')}
      </Typography>

      <TableContainer
        sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.2)', overflow: 'hidden' }}
      >
        <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.value}
                  align="center"
                  sx={{
                    bgcolor: column.color,
                    border: '1px solid #000',
                    fontSize: '1em',
                    py: '0.875em',
                    px: '0.5em',
                    ...(index === 0 && { borderTopLeftRadius: 8 }),
                    ...(index === columns.length - 1 && { borderTopRightRadius: 8 })
                  }}
                >
                  <Typography fontSize="1em" fontWeight={700}>
                    {t(`level-${column.value}`)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.value}
                  align="center"
                  sx={{
                    border: '1px solid rgba(0,0,0,0.2)',
                    fontSize: '1em',
                    p: '0.75em',
                    pr: '0.5em',
                    pl: '0.25em',
                    backgroundColor: '#fff'
                  }}
                >
                  <Radio
                    value={column.value}
                    disableRipple
                    sx={{ p: '0.5em' }}
                    icon={
                      <UncheckedIcon
                        sx={{
                          fontSize: '1.5em',
                          color: 'rgba(0,0,0,0.24)'
                        }}
                      />
                    }
                    checkedIcon={<CheckedIcon sx={{ fontSize: '1.5em', color: '#0071e3' }} />}
                    checked={value === column.value}
                    onChange={() => handleGPValueChange(column.value)}
                    disabled={disabled}
                  />
                </TableCell>
              ))}
            </TableRow>
            {(value === 4 || value === 2) && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  sx={{
                    border: '1px solid rgba(0,0,0,0.2)',
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={t(`notes-placeholder-${value}`)}
                    value={localNotes}
                    onChange={e => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    disabled={disabled}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        backgroundColor: '#fff',
                        '& fieldset': {
                          borderColor: theme.palette.divider
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid() || disabled}
          size="large"
        >
          {t('submit-button')}
        </Button>
      </Box>
    </Paper>
  );
};
