import { Typography } from '@mui/material';

interface ScoreCellProps {
  score: number | undefined;
}

export const ScoreCell = ({ score }: ScoreCellProps) => {
  if (score === undefined) {
    return <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>—</Typography>;
  }
  return <Typography>{score}</Typography>;
};
