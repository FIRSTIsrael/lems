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
          p: 1.75,
          gap: 1.25
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.975rem' }}>
            Picklist
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {picklistTeams.length} / {picklistLimit}
          </Typography>
        </Box>

        {/* Suggested team slot */}
        {suggestedTeam && canAddMore && !picklistTeams.find(t => t.id === suggestedTeam.id) && (
          <Paper
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              border: `2px dashed ${theme.palette.success.main}`,
              borderRadius: 0.75,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">
                Suggested
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
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
                gap: 0.75,
                p: 0.75,
                bgcolor: snapshot.isDraggingOver
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
                borderRadius: 0.75,
                border: `1px solid ${theme.palette.divider}`,
                overflowY: 'auto',
                minHeight: 0
              }}
            >
              {picklistTeams.length === 0 ? (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{
                    py: 1.5,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >
                  Drag or add teams
                </Typography>
              ) : (
                picklistTeams.map((team, index) => (
                  <Draggable key={team.id} draggableId={`picklist-item-${team.id}`} index={index}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={snapshot.isDragging ? 3 : 0}
                        sx={{
                          p: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: snapshot.isDragging
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          border: snapshot.isDragging
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          borderRadius: 0.75,
                          transition: 'all 0.2s',
                          cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                        }}
                      >
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            flex: 1,
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            minWidth: 0
                          }}
                        >
                          {index < 3 && (
                            <EmojiEvents
                              sx={{
                                color: MEDAL_COLORS[index as 0 | 1 | 2],
                                fontSize: '1.1rem',
                                flexShrink: 0
                              }}
                            />
                          )}
                          {index >= 3 && (
                            <Box
                              sx={{
                                minWidth: '18px',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: theme.palette.text.secondary
                              }}
                            >
                              {index + 1}
                            </Box>
                          )}
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, display: 'block' }}
                            >
                              {team.number}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {team.name}
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeFromPicklist(team.id)}
                            sx={{ color: theme.palette.error.main, flexShrink: 0 }}
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

        {/* Trash zone */}
        <Droppable droppableId="picklist-trash">
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: '45px',
                p: 0.75,
                bgcolor: snapshot.isDraggingOver
                  ? alpha(theme.palette.error.main, 0.12)
                  : alpha(theme.palette.error.main, 0.04),
                border: `2px dashed ${theme.palette.error.main}`,
                borderRadius: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
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
