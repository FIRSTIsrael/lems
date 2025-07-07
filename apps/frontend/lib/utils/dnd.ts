import { DraggableLocation } from '@hello-pangea/dnd';

export const copyToDroppable = (
  source: Array<any>,
  destination: Array<any>,
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const result = [...destination];
  const item = structuredClone(source[droppableSource.index]);
  result.splice(droppableDestination.index, 0, item);
  return result;
};
