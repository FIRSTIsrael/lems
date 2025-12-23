'use client';

import { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Stack, Typography, Paper, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import { Close, EmojiEvents, Add } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

const MEDAL_COLORS = {
  0: '#FFD700', // Gold
  1: '#C0C0C0', // Silver
  2: '#CD7F32' // Bronze
};

export function PicklistPanel() {
  const theme = useTheme();
  const {
    picklistTeams,
    suggestedTeam,
    picklistLimit,
    reorderPicklist,
    addToPicklist,
    removeFromPicklist
  } = useCategoryDeliberation();

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) {
        return;
      }

      // If dropped in trash
      if (destination.droppableId === 'picklist-trash') {
        const teamId = draggableId.replace('picklist-item-', '');
        await removeFromPicklist(teamId);
        return;
      }

      // If dropped in picklist
      if (destination.droppableId === 'picklist-items') {
        if (source.droppableId === 'picklist-items' && source.index !== destination.index) {
          await reorderPicklist(source.index, destination.index);
        }
      }
    },
    [reorderPicklist, removeFromPicklist]
  );

  const canAddMore = picklistTeams.length < picklistLimit;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Stack
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1.5
        }}
      >
        {/* Header */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Picklist
        </Typography>

        {/* Suggested team slot */}
        {suggestedTeam && canAddMore && !picklistTeams.find(t => t.id === suggestedTeam.id) && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              border: `2px dashed ${theme.palette.success.main}`,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">
                Suggested
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {suggestedTeam.number}
              </Typography>
            </Box>
            <Tooltip title="Add to Picklist">
              <IconButton
                size="small"
                onClick={() => addToPicklist(suggestedTeam.id)}
                sx={{ color: theme.palette.success.main }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        )}

        {/* Picklist items */}
        <Droppable droppableId="picklist-items">
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1,
                bgcolor: snapshot.isDraggingOver
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                overflowY: 'auto',
                minHeight: 0
              }}
            >
              {picklistTeams.length === 0 ? (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ py: 2, textAlign: 'center' }}
                >
                  Drag teams here or use the Add button
                </Typography>
              ) : (
                picklistTeams.map((team, index) => (
                  <Draggable key={team.id} draggableId={`picklist-item-${team.id}`} index={index}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={snapshot.isDragging ? 4 : 1}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: snapshot.isDragging
                            ? `2px solid ${theme.palette.primary.main}`
                            : '1px solid transparent',
                          transition: 'all 0.2s',
                          cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                          opacity: snapshot.isDragging ? 1 : 1
                        }}
                      >
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flex: 1,
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                          }}
                        >
                          {index < 3 && (
                            <EmojiEvents
                              sx={{
                                color: MEDAL_COLORS[index as 0 | 1 | 2],
                                fontSize: '1.25rem'
                              }}
                            />
                          )}
                          {index >= 3 && (
                            <Box
                              sx={{
                                minWidth: '20px',
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: theme.palette.text.secondary
                              }}
                            >
                              {index + 1}
                            </Box>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {team.number}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {team.name}
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeFromPicklist(team.id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        {/* Limit indicator */}
        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
          {picklistTeams.length} / {picklistLimit}
        </Typography>

        {/* Trash zone */}
        <Droppable droppableId="picklist-trash">
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: '50px',
                p: 1,
                bgcolor: snapshot.isDraggingOver
                  ? alpha(theme.palette.error.main, 0.15)
                  : alpha(theme.palette.error.main, 0.05),
                border: `2px dashed ${theme.palette.error.main}`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Typography variant="caption" color="error">
                Drop to Remove
              </Typography>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Stack>
    </DragDropContext>
  );
}
