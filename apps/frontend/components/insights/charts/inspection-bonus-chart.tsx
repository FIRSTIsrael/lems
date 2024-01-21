import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Typography, Paper, Skeleton } from '@mui/material';
import { Event } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';

interface InspectionBonusChartProps {
  event: WithId<Event>;
}

type InspectionBonusChartData = { successRate: number; rows: Array<object> };

const InspectionBonusChart: React.FC<InspectionBonusChartProps> = ({ event }) => {
  const [data, setData] = useState<InspectionBonusChartData | null>(null);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/field/missions/inspection-bonus`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [event._id]);

  const columns: GridColDef[] = [
    {
      field: 'teamName',
      headerName: 'שם',
      width: 150
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
      width: 400,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.teamAffiliation.name}, ${params.row.teamAffiliation.city}`
    },
    { field: 'count', headerName: 'אי הצלחות', width: 150 }
  ];

  return (
    <Paper>
      {data ? (
        <>
          <Typography fontSize="1.5rem" fontWeight={500} textAlign="center" pt={1}>
            בונוס ביקורת הציוד
          </Typography>
          <Typography textAlign="center" color="#666">
            {Number(data.successRate.toFixed(2))}% הצלחה
          </Typography>
          <DataGrid
            rows={data.rows}
            columns={columns}
            hideFooter={true}
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

export default InspectionBonusChart;
