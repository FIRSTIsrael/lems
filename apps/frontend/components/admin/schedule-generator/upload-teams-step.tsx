import { useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Stack,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { Division, Team } from '@lems/types';
import UploadFileButton from '../../general/upload-file';
import { apiFetch } from '../../../lib/utils/fetch';

interface UploadTeamsStepProps {
  division: WithId<Division>;
  advanceStep: () => void;
}

const UploadTeamsStep: React.FC<UploadTeamsStepProps> = ({ division, advanceStep }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>> | null>(null);

  const fetchTeams = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/teams`);
    const data = await response.json();
    setTeams(data);
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (teams === null) return null;

  return (
    <>
      <UploadFileButton
        urlPath={`/api/admin/divisions/${division?._id}/team-list`}
        displayName="רשימת קבוצות"
        extension=".csv"
        reload={false}
        onSuccess={() => fetchTeams()}
        onError={() => enqueueSnackbar('הייתה שגיאה בהעלאת רשימת הקבוצות', { variant: 'error' })}
      />

      {teams.length > 0 && (
        <TableContainer
          sx={{ border: '1px solid #666', borderRadius: 2, overflow: 'hidden', my: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>מספר</TableCell>
                <TableCell>שם</TableCell>
                <TableCell>מוסד</TableCell>
                <TableCell>עיר</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{team.number}</TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.affiliation.name}</TableCell>
                  <TableCell>{team.affiliation.city}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" disabled>
          הקודם
        </Button>
        <Button variant="contained" onClick={advanceStep} disabled={teams.length === 0}>
          הבא
        </Button>
      </Stack>
    </>
  );
};

export default UploadTeamsStep;
