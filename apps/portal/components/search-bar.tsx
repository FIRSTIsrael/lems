import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { PortalTeam } from '@lems/types';

interface SearchBarProps {
  teams: PortalTeam[];
  setFilteredTeams: (teams: PortalTeam[]) => void;
  sx?: object;
}

const SearchBar: React.FC<SearchBarProps> = ({ teams, setFilteredTeams, sx }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredTeams = teams.filter(
      team =>
        team.name.toLowerCase().includes(value) ||
        team.number.toString().includes(value) ||
        team.affiliation.city.toLowerCase().includes(value) ||
        team.affiliation.name.toLowerCase().includes(value)
    );

    setFilteredTeams(filteredTeams);
  };

  return (
    <TextField
      value={searchTerm}
      onChange={handleSearch}
      label="חיפוש"
      variant="outlined"
      fullWidth
      sx={sx}
    />
  );
};

export default SearchBar;
