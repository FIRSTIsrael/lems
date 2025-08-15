import { Box } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { SeasonHeader } from './season-header';
import { EventGrid } from './event-grid';

interface CurrentSeasonProps {
  season: Season;
}

export const CurrentSeason: React.FC<CurrentSeasonProps> = ({ season }) => {
  return (
    <>
      <Box p={3}>
        <SeasonHeader seasonName={season.name} logoUrl={season.logoUrl} allowCreate />
      </Box>

      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          mb: 4,
          backgroundColor: 'grey.50',
          minHeight: 200
        }}
      >
        <EventGrid events={[]} />
      </Box>
    </>
  );
};
