import { createContext, useState } from 'react';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';

export interface CompareContextValues {
  teams: Array<WithId<Team>>;
  rubrics: any;
  cvForms: any;
}

interface CompareViewProps {
  teams: Array<WithId<Team>>;
  rubrics: any;
  cvForms: any;
}

const CompareView: React.FC<CompareViewProps> = props => {
  //TODO: context can have different, changing values
  // stored in state or memo. Currently just uses the default always.
  const [compareData, setCompareData] = useState(props);
  const CompareContext = createContext<CompareContextValues>({} as CompareContextValues);

  return (
    <CompareContext.Provider value={compareData}>
      <Grid container>
        {props.teams.map(team => (
          <CompareViewTeam team={team} />
        ))}
      </Grid>
    </CompareContext.Provider>
  );
};

interface CompareViewTeamProps {
  team: any;
}

const CompareViewTeam: React.FC<CompareViewTeamProps> = ({ team }) => {
  return <Grid xs={6}>{team.name}</Grid>;
};

export default CompareView;
