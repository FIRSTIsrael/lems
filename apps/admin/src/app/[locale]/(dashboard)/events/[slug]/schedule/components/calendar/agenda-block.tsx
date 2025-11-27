'use client';

import React from 'react';
import { Dayjs } from 'dayjs';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ScheduleBlock, BLOCK_COLORS, HEADER_HEIGHT } from './calendar-types';
import { calculateBlockPosition } from './calendar-utils';
import { useCalendar } from './calendar-context';
import { TitleEditDialog } from './agenda-block/title-edit-dialog';
import { ResizeHandles } from './agenda-block/resize-handles';
import { BlockContent } from './agenda-block/block-content';
import { useTitleEdit } from './agenda-block/use-title-edit';

interface AgendaBlockProps {
  block: ScheduleBlock;
  startTime: Dayjs;
  isDraggingBody: boolean;
  isDraggingEdge: boolean;
  draggedPosition: number;
  draggedDuration?: number; // For bottom-edge resize preview
  draggedStartTime?: Dayjs; // For top-edge resize preview
  onDragStartBody: (block: ScheduleBlock, startY: number) => void;
  onDragStartTopEdge: (block: ScheduleBlock, startY: number) => void;
  onDragStartBottomEdge: (block: ScheduleBlock, startY: number) => void;
  onUpdateTitle: (blockId: string, newTitle: string) => void;
}

export const AgendaBlock: React.FC<AgendaBlockProps> = ({
  block,
  startTime,
  isDraggingBody,
  isDraggingEdge,
  draggedPosition,
  draggedDuration,
  draggedStartTime,
  onDragStartBody,
  onDragStartTopEdge,
  onDragStartBottomEdge,
  onUpdateTitle
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  const { deleteAgendaEvent } = useCalendar();
  const titleEdit = useTitleEdit(block.title || t('default-event-title'));

  const position = calculateBlockPosition(startTime, block);

  const displayStartTime = draggedStartTime || block.startTime;
  const displayDuration = draggedDuration || block.durationSeconds;
  const displayPosition = calculateBlockPosition(startTime, {
    ...block,
    startTime: displayStartTime,
    durationSeconds: displayDuration
  });

  const finalTop = isDraggingEdge
    ? displayPosition.top
    : isDraggingBody
      ? draggedPosition - HEADER_HEIGHT
      : position.top;
  const finalHeight = isDraggingEdge ? displayPosition.height : position.height;

  const handleMouseDownBody = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag]')) {
      e.stopPropagation();
      return;
    }
    if (e.button === 0 && !isDraggingEdge) {
      e.stopPropagation();
      onDragStartBody(block, e.clientY);
    }
  };

  const handleMouseDownTopEdge = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      onDragStartTopEdge(block, e.clientY);
    }
  };

  const handleMouseDownBottomEdge = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      onDragStartBottomEdge(block, e.clientY);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteAgendaEvent(block.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    titleEdit.openEdit();
  };

  const handleSaveTitle = () => {
    if (onUpdateTitle) {
      onUpdateTitle(block.id, titleEdit.editedTitle);
    }
    titleEdit.closeEdit();
  };

  const handleCancelEdit = () => {
    titleEdit.resetEdit(block.title || t('default-event-title'));
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: finalTop,
        left: 8,
        right: 8,
        height: finalHeight,
        backgroundColor: BLOCK_COLORS[block.type],
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 1,
        cursor: isDraggingBody ? 'grabbing' : 'grab',
        zIndex: isDraggingBody || isDraggingEdge ? 1000 : 1,
        opacity: isDraggingBody || isDraggingEdge ? 0.9 : 1,
        boxShadow:
          isDraggingBody || isDraggingEdge
            ? '0 8px 16px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.1)',
        transition: isDraggingBody || isDraggingEdge ? 'none' : 'all 0.2s ease',
        transform: isDraggingBody || isDraggingEdge ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1,
        px: 1,
        '&:hover': {
          boxShadow:
            isDraggingBody || isDraggingEdge
              ? '0 8px 16px rgba(0,0,0,0.3)'
              : '0 2px 6px rgba(0,0,0,0.2)',
          transform: isDraggingBody || isDraggingEdge ? 'scale(1.02)' : 'scale(1.01)',
          '& .delete-button': {
            opacity: 1
          },
          '& .edit-button': {
            opacity: 1
          }
        }
      }}
      onMouseDown={handleMouseDownBody}
    >
      <ResizeHandles
        onMouseDownTopEdge={handleMouseDownTopEdge}
        onMouseDownBottomEdge={handleMouseDownBottomEdge}
      />

      <TitleEditDialog
        open={titleEdit.isEditingTitle}
        title={titleEdit.editedTitle}
        onTitleChange={titleEdit.setEditedTitle}
        onSave={handleSaveTitle}
        onCancel={handleCancelEdit}
      />

      <BlockContent
        title={block.title || t('default-event-title')}
        startTime={block.startTime}
        durationSeconds={block.durationSeconds}
        onEditClick={handleEditClick}
        onDeleteClick={handleDelete}
      />
    </Box>
  );
};
