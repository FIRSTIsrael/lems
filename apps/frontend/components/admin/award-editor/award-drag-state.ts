import { AwardNames } from '@lems/types';

export type DragState =
  | {
      type: 'idle';
    }
  | {
      type: 'dragging';
      award: AwardNames;
      awardIndex: number;
    }
  | {
      type: 'is-over';
      award: AwardNames;
      awardIndex: number;
      dragging: DOMRect;
      destinationIndex: number;
    };

export const idle: DragState = { type: 'idle' };
