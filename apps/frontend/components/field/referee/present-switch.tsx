import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { RobotGameMatchPresent } from '@lems/types';
import { localizedMatchPresent } from '../../../localization/field';

interface PresentSwitchProps {
  value?: RobotGameMatchPresent;
  onChange?: (value: RobotGameMatchPresent) => void;
  disabled?: boolean;
}

const PresentSwitch: React.FC<PresentSwitchProps> = ({ value, onChange, disabled }) => {
  return (
    <Paper
      elevation={0}
      sx={theme => ({
        display: 'inline-flex',
        flexWrap: 'wrap',
        backgroundColor: theme.palette.grey[100]
      })}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(event, value) => onChange?.(value)}
        disabled={disabled}
        sx={theme => ({
          '& .MuiToggleButtonGroup-grouped': {
            margin: theme.spacing(0.5),
            border: '1px solid transparent',
            px: 1.75,
            py: 1,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider
            },
            '&.Mui-selected:hover': {
              backgroundColor: theme.palette.background.paper,
              opacity: 0.7
            },
            '&.Mui-disabled': {
              border: 0
            },
            '&:not(:first-of-type)': {
              borderRadius: '0.75rem'
            },
            '&:first-of-type': {
              borderRadius: '0.75rem'
            },
            transition: '100ms ease-in-out'
          }
        })}
      >
        <ToggleButton
          value="no-show"
          sx={{
            '&.Mui-selected': {
              color: theme => `${theme.palette.error.main} !important`
            }
          }}
        >
          {localizedMatchPresent['no-show']}
        </ToggleButton>
        <ToggleButton
          value="present"
          sx={{
            '&.Mui-selected': {
              color: theme => `${theme.palette.primary.main} !important`
            }
          }}
        >
          {' '}
          {localizedMatchPresent['present']}
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};

export default PresentSwitch;
