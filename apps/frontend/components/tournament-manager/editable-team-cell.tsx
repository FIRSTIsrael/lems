import { useState } from 'react';
import { WithId } from 'mongodb';
import { Autocomplete, TextField } from '@mui/material';
import { Team } from '@lems/types';

interface EditableTeamCellProps {
  teams: Array<WithId<Team>>;
  initialTeam: WithId<Team> | null;
}

const EditableTeamCell: React.FC<EditableTeamCellProps> = ({ teams, initialTeam }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(initialTeam);

  let dropdownOptions: Array<WithId<Team> | null> = [null];
  dropdownOptions = dropdownOptions.concat(teams.sort((a, b) => a.number - b.number));

  return (
    <Autocomplete
      options={dropdownOptions}
      getOptionLabel={team => (team ? team.number.toString() : '-')}
      inputMode="search"
      value={team}
      disableClearable={team !== null}
      onChange={(_e, value) => setTeam(value)}
      renderInput={params => (
        <TextField
          {...params}
          variant="standard"
          InputProps={{
            ...params.InputProps,
            disableUnderline: true
          }}
        />
      )}
    />
  );
};

export default EditableTeamCell;
