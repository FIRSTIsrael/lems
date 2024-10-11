import { WithId } from 'mongodb';
import React from 'react';
import { Autocomplete, TextField, SxProps, Theme, TextFieldVariants } from '@mui/material';
import { Team } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface TeamSelectionProps {
  teams: WithId<Team>[] | undefined;
  value: WithId<Team> | null;
  setTeam: (team: WithId<Team> | null) => void;
  readOnly?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  numberOnly?: boolean;
  size?: 'small' | 'medium';
  variant?: TextFieldVariants;
  sx?: SxProps<Theme>;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  value,
  setTeam,
  readOnly = false,
  disabled = false,
  numberOnly = false,
  variant,
  ...props
}) => {
  return (
    <Autocomplete
      {...props}
      blurOnSelect
      options={teams ? teams : []}
      getOptionLabel={team =>
        typeof team !== 'string' ? (numberOnly ? team.number.toString() : localizeTeam(team)) : ''
      }
      inputMode="search"
      value={value}
      onChange={(_e, value) => setTeam(typeof value !== 'string' ? value : null)}
      renderInput={params => <TextField {...params} label="קבוצה" variant={variant} />}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
};

export default TeamSelection;
