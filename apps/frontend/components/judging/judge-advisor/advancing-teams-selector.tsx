import { WithId } from 'mongodb';
import { useState } from 'react';
import { Field, FieldProps } from 'formik';
import { Paper, Typography, Button, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Team } from '@lems/types';
import TeamSelection from '../../general/team-selection';
import { localizeTeam } from '../../../localization/teams';

interface AdvancingTeamsSelectorProps {
  teams: Array<WithId<Team>>;
  readOnly?: boolean;
}

const AdvancingTeamsSelector: React.FC<AdvancingTeamsSelectorProps> = ({ teams, readOnly }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);

  return (
    <Field name="advancingTeams">
      {({ field, form }: FieldProps) => {
        return (
          <Stack component={Paper} p={2} spacing={2}>
            <Grid container alignItems="center">
              <Grid xs={4}>
                <Typography fontSize="1rem" fontWeight={700}>
                  קבוצות המעפילות לאליפות
                </Typography>
              </Grid>
              <Grid xs={6}>
                <TeamSelection
                  teams={teams.filter(
                    t => !t.advancing && !field.value.some((_t: WithId<Team>) => _t._id === t._id)
                  )}
                  value={team}
                  setTeam={setTeam}
                />
              </Grid>
              <Grid xs={2} textAlign={'center'}>
                <Button
                  variant="contained"
                  onClick={e => {
                    if (team) {
                      e.preventDefault();
                      form.setFieldValue(field.name, field.value ? [...field.value, team] : [team]);
                      setTeam(null);
                      console.log(field.value);
                    }
                  }}
                >
                  הוסף
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              {field.value.map((team: WithId<Team>, index: number) => (
                <Grid xs={6} key={index}>
                  <Chip
                    label={localizeTeam(team)}
                    sx={{ width: '100%' }}
                    onDelete={e => {
                      e.preventDefault();
                      const teamIndex = field.value.findIndex(
                        (t: WithId<Team>) => t._id === team._id
                      );
                      const currentValue = [...field.value];
                      currentValue.splice(teamIndex, 1);
                      form.setFieldValue(field.name, currentValue);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        );
      }}
    </Field>
  );
};

export default AdvancingTeamsSelector;
