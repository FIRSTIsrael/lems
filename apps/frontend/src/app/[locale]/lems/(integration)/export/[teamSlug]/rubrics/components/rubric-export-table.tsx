'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stack
} from '@mui/material';

interface RubricExportTableProps {
  rubric: {
    data: {
      fields: Record<string, number>;
      feedback?: {
        greatJob: string;
        thinkAbout: string;
      };
    };
  };
  showFeedback?: boolean;
}

export const RubricExportTable: React.FC<RubricExportTableProps> = ({
  rubric,
  showFeedback = true
}) => {
  const feedback = rubric.data?.feedback;

  return (
    <Box
      dir="rtl"
      sx={{
        width: '115%',
        mt: 1,
        mb: -5,
        mr: -3,
        ml: -7,
        '@media print': {
          height: 'fit-content',
          overflow: 'hidden',
          pageBreakInside: 'avoid !important',
          breakInside: 'avoid !important'
        }
      }}
    >
      <Table
        sx={{
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          maxWidth: '100%',
          width: '100%',
          position: 'relative',
          border: '2px solid #000',
          transform: 'scale(0.75)',
          transformOrigin: 'top center',
          '@media print': {
            width: '100%',
            tableLayout: 'fixed',
            pageBreakInside: 'avoid !important',
            breakInside: 'avoid !important'
          },
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
        <TableHead sx={{ p: '0.5rem 0.25rem' }}>
          <TableRow>
            <TableCell align="right">
              <Typography fontWeight={700}>Criteria</Typography>
            </TableCell>
            {[1, 2, 3, 4].map(level => (
              <TableCell key={level} align="center" sx={{ width: '15%' }}>
                <Typography fontWeight={700}>{level}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Placeholder for dynamic rubric sections */}
          <TableRow>
            <TableCell colSpan={5}>
              <Typography variant="body2" color="textSecondary">
                Rubric data rendering
              </Typography>
            </TableCell>
          </TableRow>
          {showFeedback && feedback && (
            <TableRow>
              <TableCell colSpan={5}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Great Job
                    </Typography>
                    <Typography variant="body2">{feedback.greatJob}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Think About
                    </Typography>
                    <Typography variant="body2">{feedback.thinkAbout}</Typography>
                  </Box>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
