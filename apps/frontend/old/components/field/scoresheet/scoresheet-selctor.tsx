import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Button, Stack, Typography } from '@mui/material';
import { purple } from '@mui/material/colors';
import NextLink from 'next/link';
import { DivisionWithEvent, Scoresheet, Team } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedMatchStage } from '../../../localization/field';

interface ScoresheetSelectorProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  matchScoresheet: WithId<Scoresheet>;
}

const ScoresheetSelector: React.FC<ScoresheetSelectorProps> = ({
  division,
  team,
  matchScoresheet
}) => {
  const [teamScoresheets, setTeamScoresheets] = useState<Array<WithId<Scoresheet>> | undefined>(
    undefined
  );

  useEffect(() => {
    apiFetch(`/api/divisions/${division._id}/teams/${team._id}/scoresheets`)
      .then(res => res.json())
      .then((data: Array<WithId<Scoresheet>>) =>
        setTeamScoresheets(
          data.sort((a, b) =>
            a.stage === b.stage ? a.round - b.round : a.stage === 'practice' ? -1 : 1
          )
        )
      );
  }, [division._id, team._id]);

  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {teamScoresheets &&
        teamScoresheets.map(scoresheet => {
          return (
            <NextLink
              key={scoresheet._id.toString()}
              href={`/lems/team/${team._id}/scoresheet/${scoresheet._id}`}
              passHref
              legacyBehavior
            >
              <Button
                variant="contained"
                color="inherit"
                sx={{
                  backgroundColor:
                    matchScoresheet._id === scoresheet._id ? purple[700] : 'transparent',
                  borderRadius: '2rem',
                  '&:hover': {
                    backgroundColor:
                      matchScoresheet._id == scoresheet._id ? purple[700] : purple[700] + '1f'
                  },
                  display: 'block',
                  textAlign: 'center',
                  minWidth: 150,
                  minHeight: 60
                }}
              >
                <Typography
                  fontSize="1rem"
                  fontWeight={500}
                  sx={{ color: matchScoresheet._id === scoresheet._id ? '#fff' : purple[700] }}
                  gutterBottom
                >
                  מקצה {localizedMatchStage[scoresheet.stage]} #{scoresheet.round}
                </Typography>
                {scoresheet.data && (
                  <Typography
                    fontSize="0.75rem"
                    fontWeight={500}
                    sx={{ color: matchScoresheet._id === scoresheet._id ? '#fff' : purple[700] }}
                  >
                    {scoresheet.data.score} נק&apos;,{' '}
                    {scoresheet.data.gp?.value && `GP - ${scoresheet.data.gp.value}`}
                  </Typography>
                )}
              </Button>
            </NextLink>
          );
        })}
    </Stack>
  );
};

export default ScoresheetSelector;
