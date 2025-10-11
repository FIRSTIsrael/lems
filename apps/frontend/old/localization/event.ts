import { DivisionWithEvent } from '@lems/types';

export const localizeDivisionTitle = (division: DivisionWithEvent) =>
  division.event.enableDivisions
    ? `${division.event.name} - בית ${division.name}`
    : division.event.name;
