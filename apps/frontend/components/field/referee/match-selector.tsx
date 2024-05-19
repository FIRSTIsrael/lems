import { WithId } from 'mongodb';
import { Paper, Typography, List, ListItemButton, ListItemText, Chip } from '@mui/material';
import NextLink from 'next/link';
import { RobotGameMatch, Division, DivisionState, RobotGameTable } from '@lems/types';

interface MatchSelectorProps {
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  table: WithId<RobotGameTable>;
}

const MatchSelector: React.FC<MatchSelectorProps> = ({
  division,
  divisionState,
  matches,
  table
}) => {
  const activeMatches = matches.filter(
    m => m._id === divisionState.activeMatch || m._id === divisionState?.loadedMatch
  );

  return (
    <Paper sx={{ px: 4, py: 2, my: 6 }}>
      {activeMatches?.length === 0 ? (
        <Typography fontSize="xl" fontWeight={500} align="center">
          אין מקצים פעילים
        </Typography>
      ) : (
        <List>
          {activeMatches?.map(match => {
            const participant = match.participants
              .filter(p => p.teamId)
              .find(p => p.tableId === table._id);

            return (
              <NextLink
                key={match._id.toString()}
                href={`/lems/${division._id}/referee/matches/${match._id}`}
                passHref
                legacyBehavior
              >
                <ListItemButton sx={{ borderRadius: 2 }} component="a">
                  <ListItemText
                    primary={`מקצה ${match.number}`}
                    secondary={`${participant?.team?.affiliation.name}, ${participant?.team?.affiliation.city}`}
                  />
                  {match.status === 'in-progress' && (
                    <Chip label="התחיל" color="primary" size="small" />
                  )}
                  {match.status === 'completed' && (
                    <Chip label="הסתיים, ממתין לניקוד" size="small" />
                  )}
                </ListItemButton>
              </NextLink>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default MatchSelector;
