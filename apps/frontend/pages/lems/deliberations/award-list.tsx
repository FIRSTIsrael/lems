import { WithId } from 'mongodb';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Team } from '@lems/types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { errorAnimation } from '../../../lib/utils/animations';

interface AwardListItemProps {
  droppableId: string;
  team: WithId<Team>;
  index: number;
  shouldPlayErrorAnimation: boolean;
}

const AwardListItem: React.FC<AwardListItemProps> = ({
  droppableId,
  team,
  index,
  shouldPlayErrorAnimation
}) => {
  return (
    <Draggable draggableId={droppableId + team._id.toString()} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef}>
          <Paper
            sx={{
              border: shouldPlayErrorAnimation
                ? ''
                : `2px ${typeof team === 'string' ? 'dashed' : 'solid'} #ccc`,
              borderRadius: 2,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              animation: shouldPlayErrorAnimation
                ? `${errorAnimation} 1s linear infinite alternate`
                : ''
            }}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
          >
            {typeof team === 'string' ? team : team.number}
          </Paper>
        </div>
      )}
    </Draggable>
  );
};

interface AwardListProps {
  state: Array<WithId<Team>>;
  id: string;
}

const AwardList: React.FC<AwardListProps> = ({ state, id }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Droppable key={id} droppableId={id}>
        {(provided, snapshot) => (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              ...(snapshot.isDraggingOver && { border: '3px dashed #ccc', backgroundColor: '#eee' })
            }}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <Stack spacing={2}>
              {state.map((team, index) => (
                <AwardListItem
                  droppableId={id}
                  team={team}
                  index={index}
                  shouldPlayErrorAnimation={
                    snapshot.isDraggingOver && snapshot.draggingOverWith === team._id.toString()
                  }
                />
              ))}
            </Stack>
            {provided.placeholder}
            {/* <Paper
              sx={{
                display: snapshot.isDraggingOver ? 'flex' : 'none',
                borderRadius: 4,
                
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                mt: 2
              }}
            /> */}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

export default AwardList;
