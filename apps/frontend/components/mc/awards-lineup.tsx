import { useState, useEffect, useMemo, Fragment } from 'react';
import { WithId } from 'mongodb';
import { Paper, Typography } from '@mui/material';
import { Event, Team, Award } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import { localizedAward } from '@lems/season';
import Markdown from 'react-markdown';
import { localizeTeam } from 'apps/frontend/localization/teams';

interface AwardsLineupProps {
  event: WithId<Event>;
}

const AwardsLineup: React.FC<AwardsLineupProps> = ({ event }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [awards, setAwards] = useState<Array<WithId<Award>>>([]);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/awards`).then(res =>
      res.json().then(data => setAwards(data))
    );
    apiFetch(`/api/events/${event._id}/teams`).then(res => res.json().then(data => setTeams(data)));
  }, [event._id]);

  const advancingTeams = useMemo(() => teams.filter(t => t.advancing), [teams]);
  const lineup = useMemo(() => {
    const awardIndices = [...new Set(awards.flatMap(a => a.index))].sort((a, b) => a - b);

    const awardScripts = awardIndices.map(index => {
      const sortedAwards = awards.filter(a => a.index === index).sort((a, b) => b.place - a.place);
      const { name: awardName } = sortedAwards[0];
      const localized = localizedAward[awardName];

      return (
        <Fragment key={awardName}>
          <Typography fontSize="1.5rem" fontWeight={500}>
            <Markdown>{`פרס ${localized.name}`}</Markdown>
          </Typography>
          <Typography fontSize="1.25rem">
            <Markdown>{localized.description}</Markdown>
          </Typography>

          {sortedAwards.map(award => {
            return (
              <Typography fontSize="1.25rem" key={award.name} gutterBottom>
                {sortedAwards.length > 1 && 'במקום ה-' + award.place + ': '}
                {award.winner
                  ? typeof award.winner === 'string'
                    ? award.winner
                    : localizeTeam(award.winner)
                  : ''}
              </Typography>
            );
          })}
        </Fragment>
      );
    });

    if (advancingTeams.length > 0) {
      const advancingTeamsText = (
        <>
          <Typography fontSize="1.5rem" fontWeight={500} sx={{ pt: 2 }}>
            קבוצות המעפילות לתחרות האליפות
          </Typography>
          <Typography fontSize="1.25rem">
            <Markdown>
              {`רגע לפני שנכריז מי הן הקבוצות הזוכות בפרס האליפות, ישנן ${advancingTeams.length} קבוצות נוספות בתחרות אשר
              יזכו להעפיל לתחרות האליפות. אנחנו שמחים להכריז שהקבוצות הבאות, ללא סדר מסוים, זכאיות גם הן לעלות שלב:`}
            </Markdown>
          </Typography>
          {advancingTeams.map(team => (
            <Typography key={team._id.toString()} fontSize="1.25rem" gutterBottom>
              {localizeTeam(team)}
            </Typography>
          ))}
        </>
      );
      // Place advancement slide directly before champions award
      const advancingTeamsIndex = awardScripts.findIndex(script => script.key === 'champions');
      awardScripts.splice(advancingTeamsIndex, 0, advancingTeamsText);
    }

    return awardScripts;
  }, [advancingTeams, awards]);

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Typography component="h1" fontSize="2rem" fontWeight={600} align="center">
        {event.name} | פרסים
      </Typography>
      {lineup}
    </Paper>
  );
};

export default AwardsLineup;
