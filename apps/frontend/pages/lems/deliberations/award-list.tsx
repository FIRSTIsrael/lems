import { WithId } from 'mongodb';
import { Box, Paper, Stack, Typography, Grid } from '@mui/material';
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
                : `1px ${snapshot.isDragging ? 'dashed' : 'solid'} #ccc`,
              borderRadius: 1,
              minHeight: 35,
              minWidth: 100,
              maxWidth: 120,
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
    <Paper sx={{ p: 2, height: '100%', display: 'flex' }}>
      <Grid container>
        <Grid xs={9}>
          <Droppable key={id} droppableId={id}>
            {(provided, snapshot) => (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  ...(snapshot.isDraggingOver && {
                    border: '3px dashed #ccc',
                    backgroundColor: '#f4f4f4'
                  })
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <Stack spacing={2} alignItems="center">
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
              </Box>
            )}
          </Droppable>
        </Grid>
        <Grid xs={3}>
          <Stack spacing={2}>
            {[...Array(12).keys()].map(index => (
              <Typography
                fontSize="1.5rem"
                fontWeight={600}
                color="#666"
                minHeight={35}
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
                justifyContent="center"
              >
                .{index + 1}
              </Typography>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AwardList;
