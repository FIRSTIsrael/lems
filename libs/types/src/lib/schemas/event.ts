import { DivisionColor } from '../constants';

export interface Event {
  name: string;
  startDate: Date;
  endDate: Date;
  color: DivisionColor;
}
