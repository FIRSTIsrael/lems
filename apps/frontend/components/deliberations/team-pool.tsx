import { useRef } from 'react';
import { WithId } from 'mongodb';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Team } from '@lems/types';
import { useDimensions } from '../../hooks/use-dimensions';

interface TeamPoolItemProps {
  droppableId: string;
  team: WithId<Team>;
  index: number;
  disabled?: boolean;
}

const TeamPoolItem: React.FC<TeamPoolItemProps> = ({
  droppableId,
  team,
  index,
  disabled = false
}) => {
  return (
    <Grid size={1}>
      <Draggable
        key={droppableId + ':' + team._id}
        draggableId={droppableId + ':' + team._id}
        index={index}
        isDragDisabled={disabled}
      >
        {(provided, snapshot) => (
          <div ref={provided.innerRef} style={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                border: `1px ${snapshot.isDragging ? 'dashed' : 'solid'} #ccc`,
                borderRadius: 1,
                minHeight: 35,
                minWidth: 110,
                maxWidth: 110,
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
                  minWidth: 110,
                  maxWidth: 110,
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
  disabled?: boolean;
}

const TeamPool: React.FC<TeamPoolProps> = ({ teams, disabled = false }) => {
  const id = 'team-pool';
  const ref = useRef(null);
  const { width } = useDimensions(ref);

  return (
    <Paper sx={{ p: 2, height: '100%' }} ref={ref}>
      <Droppable droppableId={id} isDropDisabled>
        {provided => (
          <>
            <Grid
              container
              columns={Math.floor(width / 112)}
              columnSpacing={2}
              rowSpacing={1}
              flexDirection="row"
              alignItems="center"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {teams.map((team, index) => (
                <TeamPoolItem
                  key={index}
                  team={team}
                  index={index}
                  droppableId={id}
                  disabled={disabled}
                />
              ))}
            </Grid>
            <span style={{ display: 'none' }}>{provided.placeholder}</span>
          </>
        )}
      </Droppable>
    </Paper>
  );
};

export default TeamPool;
