import { useState, useEffect, useMemo, Fragment } from 'react';
import { WithId } from 'mongodb';
import { IconButton, Box, Paper, Stack, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import { Division, Team, Award } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import { localizedAward } from '@lems/season';
import Markdown from 'react-markdown';
import { localizeTeam } from '../../localization/teams';

interface AwardsLineupProps {
  division: WithId<Division>;
}

const AwardsLineup: React.FC<AwardsLineupProps> = ({ division }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [awards, setAwards] = useState<Array<WithId<Award>>>([]);

  const getAwardIndexFromQuery = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('awardIndex') === null
      ? 0
      : parseInt(searchParams.get('awardIndex') as string);
  };
  const updateAwardIndexInUrl = (index: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('awardIndex', index.toString());
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  };
  const [currentAward, setCurrentAwardState] = useState(getAwardIndexFromQuery());
  const setCurrentAward = (index: number) => {
    updateAwardIndexInUrl(index);
    setCurrentAwardState(index);
  };

  useEffect(() => {
    apiFetch(`/api/divisions/${division._id}/awards`).then(res =>
      res.json().then(data => setAwards(data))
    );
    apiFetch(`/api/divisions/${division._id}/teams`).then(res =>
      res.json().then(data => setTeams(data))
    );
  }, [division._id]);

  // TODO: fix advancing teams to be from final deliberation
  const advancingTeams: Array<WithId<Team>> = [];
  // const advancingTeams = useMemo(() => teams.filter(t => t.advancing), [teams]);
  const lineup = useMemo(() => {
    const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);

    const awardScripts = awardIndices.map(index => {
      const sortedAwards = awards.filter(a => a.index === index).sort((a, b) => b.place - a.place);
      const { name: awardName } = sortedAwards[0];
      const localized = localizedAward[awardName];

      return (
        <Fragment key={awardName}>
          <Box>
            <Typography fontSize="1.75rem" fontWeight={700}>
              פרס {localized.name}
            </Typography>
            <Typography fontSize="1.75rem">
              <Markdown>{localized.description}</Markdown>
            </Typography>

            {sortedAwards.map(award => {
              return (
                <Typography fontSize="1.75rem" key={award.name + award.place} gutterBottom>
                  {sortedAwards.length > 1 && 'במקום ה-' + award.place + ': '}
                  {award.winner
                    ? typeof award.winner === 'string'
                      ? award.winner
                      : localizeTeam(award.winner)
                    : ''}
                </Typography>
              );
            })}
          </Box>
        </Fragment>
      );
    });

    if (advancingTeams.length > 0) {
      const advancingTeamsText = (
        <>
          <Typography fontSize="1.75rem" fontWeight={700} sx={{ pt: 2 }}>
            קבוצות המעפילות לתחרות האליפות
          </Typography>
          <Typography fontSize="1.45rem">
            רגע לפני שנכריז מי הן הקבוצות הזוכות בפרס האליפות, ישנן {advancingTeams.length} קבוצות
            נוספות בתחרות אשר יזכו להעפיל לתחרות האליפות. אנחנו שמחים להכריז שהקבוצות הבאות, ללא סדר
            מסוים, זכאיות גם הן לעלות שלב:
          </Typography>
          {advancingTeams.map(team => (
            <Typography key={team._id.toString()} fontSize="1.75rem" gutterBottom>
              {localizeTeam(team)}
            </Typography>
          ))}
        </>
      );
      // Place advancement script directly before champions award
      const advancingTeamsIndex = awardScripts.findIndex(script => script.key === 'champions');
      awardScripts.splice(advancingTeamsIndex, 0, advancingTeamsText);
    }

    return awardScripts;
  }, [advancingTeams, awards]);

  return (
    <>
      <Typography fontSize="2.5rem" fontWeight={700} align="center" gutterBottom>
        {division.name} | פרסים
      </Typography>
      <Paper sx={{ width: '100%', p: 2, mb: 4 }}>{lineup[currentAward]}</Paper>
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <IconButton onClick={() => setCurrentAward(Math.max(currentAward - 1, 0))} size="large">
          <EastRoundedIcon fontSize="large" />
        </IconButton>
        <Typography fontSize="1.5rem">
          {lineup.length} / {currentAward + 1}
        </Typography>
        <IconButton
          onClick={() => setCurrentAward(Math.min(currentAward + 1, lineup.length - 1))}
          size="large"
        >
          <WestRoundedIcon fontSize="large" />
        </IconButton>
      </Stack>
    </>
  );
};

export default AwardsLineup;
