import { WithId } from 'mongodb';
import React from 'react';
import { Autocomplete, TextField, SxProps, Theme } from '@mui/material';
import { Team } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface TeamSelectionProps {
  teams: WithId<Team>[] | undefined;
  value: WithId<Team> | null;
  setTeam: (team: WithId<Team> | null) => void;
  readOnly?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  value,
  setTeam,
  readOnly = false,
  ...props
}) => {
  return (
    <Autocomplete
      {...props}
      blurOnSelect
      options={teams ? teams : []}
      getOptionLabel={team => (typeof team !== 'string' ? localizeTeam(team) : '')}
      inputMode="search"
      value={value}
      onChange={(_e, value) => setTeam(typeof value !== 'string' ? value : null)}
      renderInput={params => <TextField {...params} label="קבוצה" />}
      readOnly={readOnly}
    />
  );
};

export default TeamSelection;
