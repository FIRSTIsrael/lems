import { WithId } from 'mongodb';
import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Team } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface TeamSelectionProps {
  teams: WithId<Team>[] | undefined;
  setTeam: (team: WithId<Team> | null) => void;
  inputValue: string;
  setInputValue: (newValue: string) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  setTeam,
  inputValue,
  setInputValue
}) => {
  return (
    <Autocomplete
      blurOnSelect
      options={teams ? teams : []}
      getOptionLabel={team => (typeof team === 'string' ? team : localizeTeam(team))}
      inputMode="search"
      inputValue={inputValue}
      onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
      onChange={(_e, value) => typeof value !== 'string' && setTeam(value)}
      renderInput={params => <TextField {...params} label="קבוצה" />}
    />
  );
};

export default TeamSelection;
