import { WithId } from 'mongodb';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';
import { Draggable, Droppable } from 'react-beautiful-dnd';

interface TeamPoolItemProps {
  team: WithId<Team>;
  index: number;
}

const TeamPoolItem: React.FC<TeamPoolItemProps> = ({ team, index }) => {
  return (
    <Grid xs={1}>
      <Draggable key={team._id.toString()} draggableId={team._id.toString()} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef}>
            <Paper
              sx={{
                border: `1px ${snapshot.isDragging ? 'dashed' : 'solid'} #ccc`,
                borderRadius: 1,
                minHeight: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
              {...provided.dragHandleProps}
              {...provided.draggableProps}
              style={provided.draggableProps.style}
            >
              {team.number}
            </Paper>
            {snapshot.isDragging && (
              <Paper
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  minHeight: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none'
                }}
              >
                {team.number}
              </Paper>
            )}
          </div>
        )}
      </Draggable>
    </Grid>
  );
};

interface TeamPoolProps {
  teams: Array<WithId<Team>>;
}

const TeamPool: React.FC<TeamPoolProps> = ({ teams }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Droppable droppableId="team-pool" isDropDisabled>
        {provided => (
          <Grid
            container
            columns={Math.max(8, Math.ceil(teams.length / 6))}
            columnSpacing={2}
            rowSpacing={1}
            flexDirection="row"
            alignItems="center"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {teams
              .sort((a, b) => a.number - b.number)
              .map((team, index) => (
                <TeamPoolItem team={team} index={index} />
              ))}
          </Grid>
        )}
      </Droppable>
    </Paper>
  );
};

export default TeamPool;
