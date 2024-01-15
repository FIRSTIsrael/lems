import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridValueFormatterParams
} from '@mui/x-data-grid';
import { Typography, Paper, Skeleton } from '@mui/material';
import { Event } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';

interface RobotConsistencyChartProps {
  event: WithId<Event>;
}

type RobotConsistencyChartData = { avgRelStdDev: number; rows: Array<object> };

const RobotConsistencyChart: React.FC<RobotConsistencyChartProps> = ({ event }) => {
  const [data, setData] = useState<RobotConsistencyChartData | null>(null);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/field/scores/consistency`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [event._id]);

  const columns: GridColDef[] = [
    {
      field: 'teamName',
      headerName: 'שם',
      width: 125
    },
    {
      field: 'teamNumber',
      headerName: 'מספר',
      width: 80
    },
    {
      field: 'teamAffiliation',
      headerName: 'שיוך',
      sortable: false,
      width: 225,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.teamAffiliation.name}, ${params.row.teamAffiliation.city}`
    },
    {
      field: 'averageScore',
      headerName: 'ניקוד ממוצע',
      width: 100,
      valueFormatter: (params: GridValueFormatterParams) => Number(params.value.toFixed(2))
    },
    {
      field: 'stdDev',
      headerName: 'סטיית תקן',
      width: 100,
      valueFormatter: (params: GridValueFormatterParams) => Number(params.value.toFixed(2))
    },
    {
      field: 'relStdDev',
      headerName: 'סטיית תקן יחסית',
      width: 150,
      valueFormatter: (params: GridValueFormatterParams) => Number(params.value.toFixed(2)) + '%'
    }
  ];

  return (
    <Paper>
      {data ? (
        <>
          <Typography fontSize="1.5rem" fontWeight={500} textAlign="center" pt={1}>
            עקביות הרובוטים
          </Typography>
          <Typography textAlign="center" color="#666">
            {Number(data.avgRelStdDev.toFixed(2)) + '%'} סטיית תקן ממוצעת
          </Typography>
          <DataGrid
            rows={data.rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10
                }
              }
            }}
            sx={{ border: 'none' }}
            disableRowSelectionOnClick
          />
        </>
      ) : (
        <Skeleton />
      )}
    </Paper>
  );
};

export default RobotConsistencyChart;
