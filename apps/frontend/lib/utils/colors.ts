import { DivisionColor } from '@lems/types';

export const getDivisionColor = (color: DivisionColor) => {
  return color == 'red' ? '#dc2626' : '#1d4ed8';
};

export const getDivisionBackground = (color: DivisionColor) => {
  return color == 'red' ? '#dc26261a' : '#1d4ed81a';
};
