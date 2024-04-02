import { DivisionColor } from '@lems/types';

export const getDivisionColor = (color: DivisionColor) => {
  return color == 'red' ? '#ff3b30' : '#2094fa';
};

export const getDivisionBackground = (color: DivisionColor) => {
  return color == 'red' ? '#ff3b301a' : '#2094fa1a';
};
