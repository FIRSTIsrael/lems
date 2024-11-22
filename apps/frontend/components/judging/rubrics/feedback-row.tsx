import { Divider, Paper, Stack, Typography, Box, TableRow, TableCell } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FormikTextField from '../../general/forms/formik-text-field';
import Markdown from 'react-markdown';
import { JudgingCategory } from '@lems/types';

interface FeedbackRowProps {
  description: string;
  feedback: { [key: string]: string };
  isEditable: boolean;
  category: JudgingCategory;
}

const FeedbackRow: React.FC<FeedbackRowProps> = ({
  description,
  feedback,
  isEditable,
  category
}) => {
  const colors: { [K in JudgingCategory]: string } = {
    'core-values': '#F5DAD4',
    'innovation-project': '#D3DAED',
    'robot-design': '#DAE8D8'
  };

  const standalone = category === 'core-values';

  const getBorderRadius = (index: number, length: number): string | undefined => {
    if (index === 0) return '12px 0 0 0';
    if (index === length - 1) return '0 12px 0 0';
  };

  return (
    <>
      <TableRow>
        {Object.values(feedback).map((value, index) => (
          <TableCell
            colSpan={2}
            key={index}
            sx={{
              bgcolor: '#fff',
              borderTop: '1px solid #000',
              borderRight: '1px solid rgba(0,0,0,0.2)',
              borderLeft: '1px solid rgba(0,0,0,0.2)',
              borderBottom: 'none',
              border: standalone ? '2px solid black' : undefined,
              borderRadius: standalone ? getBorderRadius(index, 2) : undefined
            }}
          >
            <Typography fontWeight={600} align="center">
              {value}...
            </Typography>
          </TableCell>
        ))}
      </TableRow>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            padding: '5px'
          }
        }}
      >
        <TableCell
          colSpan={4}
          sx={{
            bgcolor: colors[category],
            border: '1px solid black'
          }}
        >
          <Box height={25} justifyContent="center" marginTop={-1}>
            <Markdown css={{ marginLeft: '12px' }}>{description}</Markdown>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            padding: '0px'
          }
        }}
      >
        {Object.entries(feedback).map(([key, value], index) => (
          <TableCell key={key} colSpan={2} sx={{ borderBottom: 'none' }}>
            <FormikTextField
              name={`feedback.${key}`}
              disabled={!isEditable}
              spellCheck
              multiline
              minRows={4}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: `0 0 ${index === 0 ? '0 12px' : '12px 0'}`
                  }
                }
              }}
            />
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};

export default FeedbackRow;
