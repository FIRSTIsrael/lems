import { Typography } from '@mui/material';

interface ScoreCellProps {
  score: number | undefined;
}

export const ScoreCell = ({ score }: ScoreCellProps) => {
  if (score === undefined) {
    return (
      <Typography
        sx={{
          color: 'text.secondary',
          fontStyle: 'italic',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        }}
      >
        —
      </Typography>
    );
  }
  return <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>{score}</Typography>;
};
