export const getColorByPlace = (place: number) => {
  switch (place) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return '#fff';
  }
};
