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
  averageDelay: number;
}

const CycleTimeReport: React.FC<CycleTimeReportProps> = ({ title, url }) => {
  const [data, setData] = useState<CycleTimeReportData | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setData(data)));
  }, [url]);

  const formatSeconds = (seconds: number | undefined) => {
    if (!seconds) return '00:00';
    const prefix = seconds < 0 ? '-' : '';
    return prefix + dayjs.duration(Math.abs(seconds), 'seconds').format('mm:ss');
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
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.average)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>חציון</TableCell>
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.median)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>נמוך ביותר</TableCell>
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.lowest)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>גבוה ביותר</TableCell>
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.highest)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>אחוזון 95</TableCell>
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.percentile95)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>עיכוב ממוצע</TableCell>
            <TableCell>
              <Typography dir="ltr">{formatSeconds(data?.averageDelay)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

export default CycleTimeReport;
