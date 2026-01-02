'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Stack, Typography, Paper, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

export function PicklistPanel() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.picklist');
  const {
    picklistTeams,
    suggestedTeam,
    picklistLimit,
    deliberation,
    reorderPicklist,
    addToPicklist,
    removeFromPicklist
  } = useCategoryDeliberation();

  const isEditable =
    deliberation?.status === 'in-progress' || deliberation?.status === 'not-started';

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination } = result;

      if (!destination) {
        return;
      }

      // If dropped in picklist
      if (destination.droppableId === 'picklist-items') {
        if (source.droppableId === 'picklist-items' && source.index !== destination.index) {
          await reorderPicklist(source.index, destination.index);
        }
      }
    },
    [reorderPicklist]
  );

  const canAddMore = picklistTeams.length < picklistLimit;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Stack
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: '0.875rem',
          gap: 0.5
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '20px'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {t('title')}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}
          >
            {picklistTeams.length} / {picklistLimit}
          </Typography>
        </Box>

        {/* Suggested team slot */}
        {suggestedTeam &&
          isEditable &&
          canAddMore &&
          !picklistTeams.find(team => team.id === suggestedTeam.id) && (
            <Paper
              sx={{
                p: '0.4rem 0.6rem',
                bgcolor: alpha(theme.palette.success.main, 0.08),
                border: `2px dashed ${theme.palette.success.main}`,
                borderRadius: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '28px'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flex: 1,
                  minWidth: 0
                }}
              >
                <Box
                  sx={{
                    minWidth: '18px',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: theme.palette.text.secondary,
                    flexShrink: 0
                  }}
                >
                  ★
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {suggestedTeam.number} | {suggestedTeam.name}
                </Typography>
              </Box>
              <Tooltip title={t('add-to-picklist')}>
                <IconButton
                  size="small"
                  onClick={() => addToPicklist(suggestedTeam.id)}
                  disabled={!isEditable}
                  sx={{ color: theme.palette.success.main, flexShrink: 0, p: '0.25rem' }}
                >
                  <Add sx={{ fontSize: '1rem' }} />
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
                gap: '0.35rem',
                p: '0.4rem',
                bgcolor:
                  snapshot.isDraggingOver && isEditable
                    ? alpha(theme.palette.primary.main, 0.05)
                    : 'transparent',
                borderRadius: 0.5,
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
                    py: 1,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    fontSize: '0.8rem'
                  }}
                >
                  {t('empty-state')}
                </Typography>
              ) : (
                picklistTeams.map((team, index) => (
                  <Draggable
                    key={team.id}
                    draggableId={`picklist-item-${team.id}`}
                    index={index}
                    isDragDisabled={!isEditable}
                  >
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={snapshot.isDragging ? 3 : 0}
                        sx={{
                          p: '0.4rem 0.6rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: snapshot.isDragging
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          border: snapshot.isDragging
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          borderRadius: 0.5,
                          transition: 'all 0.2s',
                          cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                          minHeight: '28px'
                        }}
                      >
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            flex: 1,
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            minWidth: 0
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: '18px',
                              textAlign: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: theme.palette.text.secondary,
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {team.number} | {team.name}
                          </Typography>
                        </Box>
                        <Tooltip title={t('remove')}>
                          <IconButton
                            size="small"
                            onClick={() => removeFromPicklist(team.id)}
                            disabled={!isEditable}
                            sx={{ color: theme.palette.error.main, flexShrink: 0, p: '0.25rem' }}
                          >
                            <Close sx={{ fontSize: '1rem' }} />
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
      </Stack>
    </DragDropContext>
  );
}
