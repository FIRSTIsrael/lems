import { Box } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Droppable } from '@hello-pangea/dnd';

const TrashDroppable = () => (
  <Droppable droppableId="trash">
    {(provided, snapshot) => (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          border: snapshot.isDraggingOver ? '3px dashed #ccc' : '',
          backgroundColor: '#f4f4f4'
        }}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        <DeleteOutlinedIcon sx={{ marginY: '5px', height: 40, width: 40, color: '#aaa' }} />
        <span style={{ display: 'none' }}>{provided.placeholder}</span>
      </Box>
    )}
  </Droppable>
);

export default TrashDroppable;
