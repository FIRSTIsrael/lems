import React from 'react';
import ReactMarkdown from 'react-markdown';
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
          border: '1px solid #000',
          borderTop: '2px solid #000',
          bgcolor: colors[type],
          py: '1em',
          px: '1.5em',
          textAlign: 'start',
          fontSize: '0.875em',
          fontWeight: 500
        }}
        colSpan={4}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontSize="1em" fontWeight={700} component="span">
            {title}
          </Typography>
          <Box sx={{ whiteSpace: 'pre' }}> - </Box>
          <ReactMarkdown skipHtml components={{ p: React.Fragment }}>
            {description}
          </ReactMarkdown>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TitleRow;
