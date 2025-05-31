import React, { useEffect, useRef } from 'react';
import { FastField, FieldProps } from 'formik';
import { Paper, Tooltip, Typography, IconButton, Grid } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AwardNames, MandatoryAwardTypes, AwardLimits } from '@lems/types';
import { localizedAward } from '@lems/season';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import CustomNumberInput from '../../field/scoresheet/number-input';
import AwardShadow from './award-shadow';
import { DragState } from './award-drag-state';

interface DragData {
  id: AwardNames;
  index: number;
  rect: DOMRect;
}

export function isDragData(data: unknown): data is DragData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'index' in data &&
    'rect' in data &&
    typeof (data as DragData).index === 'number'
  );
}

interface AwardItemDisplayProps {
  name: AwardNames;
  index: number;
  dragState: DragState;
  itemRef: React.RefObject<HTMLDivElement>;
  dragHandleRef: React.RefObject<HTMLDivElement>;
  onRemove: () => void;
}

export const AwardItemDisplay: React.FC<AwardItemDisplayProps> = ({
  name,
  index,
  dragState,
  itemRef,
  dragHandleRef,
  onRemove
}) => {
  const isMandatory = MandatoryAwardTypes.some(x => x === name);

  // Hide the original item when it's being dragged
  if (dragState.type === 'dragging' && dragState.award === name) {
    return null;
  }

  // Hide the item when showing a shadow in this location
  if (dragState.type === 'is-over' && dragState.destinationIndex === index) {
    return <AwardShadow dragging={dragState.dragging} />;
  }

  return (
    <Grid
      container
      component={Paper}
      px={1}
      py={2}
      direction="row"
      alignItems="center"
      ref={itemRef}
      sx={{
        cursor: 'grab',
        my: 1,
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <Grid display="flex" alignItems="center" ref={dragHandleRef} sx={{ flex: '0 0 5%' }}>
        <DragIndicatorIcon color="disabled" />
      </Grid>
      <FastField name={`${name}`}>
        {({ field, form }: FieldProps) => (
          <Grid display="flex" alignItems="center" {...field} sx={{ flex: '0 0 95%' }}>
            <Grid display="flex" alignItems="center" sx={{ flex: '0 0 20%' }}>
              {isMandatory ? (
                <Tooltip title="פרס חובה" arrow>
                  <span>
                    <IconButton disabled>
                      <LockOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <IconButton
                  onClick={() => {
                    form.setFieldValue(field.name, 0);
                    onRemove();
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Grid>
            <Grid sx={{ flex: '0 0 40%' }}>
              <Typography>פרס {localizedAward[name].name || name}</Typography>
            </Grid>
            <Grid sx={{ flex: '0 0 40%' }}>
              <CustomNumberInput
                min={1}
                max={AwardLimits[name] ?? 5}
                value={field.value}
                onChange={(e, value) => {
                  e.preventDefault();
                  if (value !== undefined) form.setFieldValue(field.name, value);
                }}
              />
            </Grid>
          </Grid>
        )}
      </FastField>
    </Grid>
  );
};

interface AwardItemProps {
  name: AwardNames;
  index: number;
  dragState: DragState;
  setDragState: (state: DragState) => void;
  onRemove: () => void;
}

const AwardItem: React.FC<AwardItemProps> = ({
  name,
  index,
  dragState,
  setDragState,
  onRemove
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const item = itemRef.current;
    const handle = dragHandleRef.current;
    if (!item || !handle) return;

    // Make the item draggable
    const cleanup = draggable({
      element: item,
      dragHandle: handle,
      getInitialData: () => ({
        id: name,
        index,
        rect: item.getBoundingClientRect()
      }),
      onDragStart: () => {
        setDragState({
          type: 'dragging',
          award: name,
          awardIndex: index
        });
      },
      onDrop: () => {
        setDragState({ type: 'idle' });
      }
    });

    return cleanup;
  }, [name, index, setDragState]);

  return (
    <AwardItemDisplay
      name={name}
      index={index}
      dragState={dragState}
      itemRef={itemRef}
      dragHandleRef={dragHandleRef}
      onRemove={onRemove}
    />
  );
};

export default AwardItem;
