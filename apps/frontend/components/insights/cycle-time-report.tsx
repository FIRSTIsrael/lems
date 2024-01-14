import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Paper, Table, TableBody, TableRow, TableCell, Typography } from '@mui/material';
import { apiFetch } from '../../lib/utils/fetch';

interface CycleTimeReportProps {
  title: string;
  url: string;
}

interface CycleTimeReportData {
  average: number;
  median: number;
  highest: number;
  lowest: number;
  percentile95: number;
}

const CycleTimeReport: React.FC<CycleTimeReportProps> = ({ title, url }) => {
  const [data, setData] = useState<CycleTimeReportData | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setData(data)));
  }, [url]);

  const formatSeconds = (seconds: number | undefined) => {
    if (seconds) return dayjs.duration(seconds, 'seconds').format('mm:ss');
    return '00:00';
  };

  return (
    <Paper sx={{ pt: 2 }}>
      <Typography textAlign="center" component="h2" fontWeight={500} fontSize="1.25rem">
        {title}
      </Typography>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>ממוצע</TableCell>
            <TableCell>{formatSeconds(data?.average)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>חציון</TableCell>
            <TableCell>{formatSeconds(data?.median)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>נמוך ביותר</TableCell>
            <TableCell>{formatSeconds(data?.lowest)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>גבוה ביותר</TableCell>
            <TableCell>{formatSeconds(data?.highest)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>אחוזון 95</TableCell>
            <TableCell>{formatSeconds(data?.percentile95)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

export default CycleTimeReport;
