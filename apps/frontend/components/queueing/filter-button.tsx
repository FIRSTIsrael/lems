import { Button, Paper, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterButtonProps {
  onClick?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
  return (
    <Button
      component={Paper}
      elevation={3}
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 65,
        left: 20,
        zIndex: 1000,
        py: 1.5,
        px: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 100,
        gap: 1,
        height: 40,
        cursor: 'pointer',
        '&:hover': {},
        color: 'black',
        backgroundColor: 'white'
      }}
    >
      <FilterListIcon fontSize="small" />
      <Typography variant="subtitle2" fontWeight={500}>
        סינון
      </Typography>
    </Button>
  );
};

export default FilterButton;
