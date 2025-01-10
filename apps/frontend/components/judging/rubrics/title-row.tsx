import React from 'react';
import Markdown from 'react-markdown';
import { Box, TableCell, TableRow, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types';

interface Props {
  title: string;
  description: string;
  category: JudgingCategory;
}

const colors: { [K in JudgingCategory]: string } = {
  'core-values': '#F5DAD4',
  'innovation-project': '#D3DAED',
  'robot-design': '#DAE8D8'
};

const TitleRow = ({ title, description, category: type }: Props) => {
  return (
    <TableRow>
      <TableCell
        align="center"
        sx={{
          border: '2px solid #000',
          bgcolor: colors[type],
          py: '0.75em',
          px: '1.5em',
          textAlign: 'start',
          fontSize: '0.875em',
          fontWeight: 500,
          '@media print': {
            py: 0,
            px: '0.25em',
            bgcolor: colors[type],
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }
        }}
        colSpan={4}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography fontSize="1em" fontWeight={700} component="span" maxWidth="10%">
            {title}
          </Typography>
          <Box sx={{ whiteSpace: 'pre' }}> - </Box>
          <Box maxWidth="85%">
            <Markdown skipHtml>{description}</Markdown>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TitleRow;
