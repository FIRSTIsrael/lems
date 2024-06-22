import { WithId } from 'mongodb';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';
import { Draggable, Droppable } from 'react-beautiful-dnd';

interface TeamPoolItemProps {
  droppableId: string;
  team: WithId<Team>;
  index: number;
}

const TeamPoolItem: React.FC<TeamPoolItemProps> = ({ droppableId, team, index }) => {
  return (
    <Grid xs={1}>
      <Draggable
        key={team._id.toString() + droppableId}
        draggableId={team._id.toString()}
        index={index}
      >
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
          // There is no placeholder here. This is on purpose, ignore the warning.
          // Don't think so? Add it and see what happens.
        )}
      </Draggable>
    </Grid>
  );
};

interface TeamPoolProps {
  teams: Array<WithId<Team>>;
  id: string;
}

const TeamPool: React.FC<TeamPoolProps> = ({ teams, id }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Droppable droppableId={id} isDropDisabled>
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
            {teams.map((team, index) => (
              <TeamPoolItem team={team} index={index} droppableId={id} />
            ))}
          </Grid>
        )}
      </Droppable>
    </Paper>
  );
};

export default TeamPool;
