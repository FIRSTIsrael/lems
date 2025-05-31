import React, { useEffect, useRef, useState } from 'react';
import { Stack } from '@mui/material';
import { AwardNames } from '@lems/types';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@lems/utils/arrays';
import AwardItem, { isDragData } from './award-item';
import AwardShadow from './award-shadow';
import { DragState, idle } from './award-drag-state';

interface AwardListProps {
  awards: AwardNames[];
  setAwards: React.Dispatch<React.SetStateAction<AwardNames[]>>;
  onRemove: (awardName: AwardNames) => void;
}

const AwardList: React.FC<AwardListProps> = ({ awards, setAwards, onRemove }) => {
  const [dragState, setDragState] = useState<DragState>(idle);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup drop target for the awards container
  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = dropTargetForElements({
      element: containerRef.current,
      getIsSticky: () => true,
      onDragStart: ({ source }) => {
        const data = source.data as unknown;
        if (!isDragData(data)) return;

        setDragState({
          type: 'dragging',
          award: data.id,
          awardIndex: data.index
        });
      },
      onDrag: ({ source, location }) => {
        const data = source.data as unknown;
        if (!isDragData(data)) return;

        // Calculate the destination index based on drag position
        const children = Array.from(containerRef.current?.children || []);
        const targetIndex = children.findIndex(child => {
          if (!child) return false;

          const rect = child.getBoundingClientRect();
          const childMiddle = rect.top + rect.height / 2;
          return location.current.input.clientY <= childMiddle;
        });

        // If over empty space at the end
        const destinationIndex = targetIndex === -1 ? awards.length : targetIndex;

        // Don't rerender if the shadow is already in the right place
        if (
          dragState.type === 'is-over' &&
          dragState.destinationIndex === destinationIndex &&
          dragState.award === data.id
        ) {
          return;
        }

        // Update drag state to show shadow at correct position
        setDragState({
          type: 'is-over',
          award: data.id,
          awardIndex: data.index,
          dragging: data.rect,
          destinationIndex
        });
      },
      onDrop: ({ source, location }) => {
        const data = source.data as unknown;
        if (!isDragData(data)) {
          setDragState(idle);
          return;
        }

        // Calculate final drop position
        const children = Array.from(containerRef.current?.children || []);
        const targetIndex = children.findIndex(child => {
          if (!child) return false;
          const rect = child.getBoundingClientRect();
          const childMiddle = rect.top + rect.height / 2;
          return location.current.input.clientY <= childMiddle;
        });

        const destinationIndex = targetIndex === -1 ? awards.length : targetIndex;

        // Only reorder if the position changed
        if (data.index !== destinationIndex) {
          setAwards(currentAwards => reorder(currentAwards, data.index, destinationIndex));
        }

        // Reset drag state
        setDragState(idle);
      },
      onDragLeave: () => {
        // Reset drag state when drag leaves the container
        setDragState(idle);
      }
    });

    return cleanup;
  }, [awards, dragState, setAwards]);

  // If drag state shows we need to place shadow at the end
  const showEndShadow = dragState.type === 'is-over' && dragState.destinationIndex >= awards.length;

  return (
    <Stack spacing={0} ref={containerRef} sx={{ mb: 2 }}>
      {awards.map((award, index) => (
        <AwardItem
          key={award}
          name={award}
          index={index}
          dragState={dragState}
          setDragState={setDragState}
          onRemove={() => onRemove(award)}
        />
      ))}
      {showEndShadow && dragState.type === 'is-over' && (
        <AwardShadow dragging={dragState.dragging} />
      )}
    </Stack>
  );
};

export default AwardList;
