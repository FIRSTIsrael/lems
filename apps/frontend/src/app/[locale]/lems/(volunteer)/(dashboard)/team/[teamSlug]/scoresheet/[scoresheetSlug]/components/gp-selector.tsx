'use client';

import { useTranslations } from 'next-intl';
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
  useTheme
} from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';

interface GPSelectorProps {
  value?: number;
  notes?: string;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onNotesChange?: (notes: string) => void;
}

const columns = [
  { value: 2, color: '#F3D0C9' },
  { value: 3, color: '#EBB3AA' },
  { value: 4, color: '#E4928B' }
];

export const GPSelector: React.FC<GPSelectorProps> = ({
  value,
  notes = '',
  disabled = false,
  onValueChange,
  onNotesChange
}) => {
  const t = useTranslations('pages.scoresheet.gp-selector');
  const theme = useTheme();

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
                    onChange={() => onValueChange?.(column.value)}
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
                    value={notes}
                    onChange={e => onNotesChange?.(e.target.value)}
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
                      },
                      '& .MuiOutlinedInput-input::placeholder': {
                        opacity: 0.7,
                        color: 'text.secondary'
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
