import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Typography } from '@mui/material';
import { CompareContext } from './compare-view';

interface CompareRubricRemarksProps {
  teamId: ObjectId;
}

const CompareGpScores: React.FC<CompareRubricRemarksProps> = ({ teamId }) => {
  const { scoresheets } = useContext(CompareContext);
  const gpScores = scoresheets
    .filter(s => s.teamId === teamId)
    .map(s => ({ round: s.round, gp: s.data?.gp }))
    .sort((a, b) => a.round - b.round);

  return (
    <Stack height={50} direction="row" px={2} spacing={2}>
      {gpScores.map(({ round, gp }) => (
        <Stack alignItems="center">
          <Typography>סבב {round}</Typography>
          <Stack direction="row" spacing={0.3}>
            {[...Array(gp?.value ?? 0).keys()].map(i => (
              <div
                key={i}
                style={{ height: 5, width: 5, backgroundColor: '#666', borderRadius: '50%' }}
              />
            ))}
          </Stack>
          {gp?.notes && <Typography>{gp?.notes}</Typography>}
        </Stack>
      ))}
    </Stack>
  );
};

export default CompareGpScores;
