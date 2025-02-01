import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { PortalTeam } from '@lems/types';
import { useRouter } from 'next/router';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  teams: PortalTeam[];
}

const SearchBar: React.FC<SearchBarProps> = ({ teams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const options = teams
    .sort((a, b) => a.number - b.number)
    .map(team => `#${team.number} - ${team.name}`);

  const handleSearch = (event: any, value: string) => {
    setSearchTerm(value);
  };

  const handleSelect = (event: any, value: string | null) => {
    if (value) {
      const selectedTeam = teams.find(team => `${team.number} - ${team.name}` === value);
      if (selectedTeam) {
        router.push(`${router.asPath}/teams/${selectedTeam.number}`);
      }
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={searchTerm}
      onInputChange={handleSearch}
      onChange={handleSelect}
      fullWidth
      clearText="נקה"
      disableClearable={searchTerm === ''}
      sx={{ pl: 2 }}
      renderInput={params => <TextField {...params} label="חיפוש" variant="outlined" fullWidth />}
    />
  );
};

export default SearchBar;
