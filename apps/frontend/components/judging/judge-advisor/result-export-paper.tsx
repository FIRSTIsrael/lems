import React, { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Typography } from '@mui/material';
import RuleIcon from '@mui/icons-material/Rule';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, JudgingCategory, JudgingCategoryTypes, Team } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { apiFetch } from '../../../lib/utils/fetch';
import ExportAction from './export-action';

interface ResultExportPaperProps {
  event: WithId<Event>;
}

const ResultExportPaper: React.FC<ResultExportPaperProps> = ({ event }) => {
  type UnscoredTeamsType = {
    [key in JudgingCategory]: Array<WithId<Team>>;
  };
  const [unscoredTeams, setUnscoredTeams] = useState<UnscoredTeamsType>({
    'core-values': [],
    'innovation-project': [],
    'robot-design': []
  });

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/validate-csv-readiness`).then(res =>
      res.json().then(data => {
        const newUnscoredTeams: UnscoredTeamsType = {} as UnscoredTeamsType;
        data.map(
          (entry: { _id: JudgingCategory; unscoredTeams: Array<WithId<Team>> }) =>
            (newUnscoredTeams[entry._id] = entry.unscoredTeams)
        );
        setUnscoredTeams(newUnscoredTeams);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          pb: 3
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#ccfbf1',
            color: '#2dd4bf',
            width: '2rem',
            height: '2rem',
            mr: 1
          }}
        >
          <ManageIcon sx={{ fontSize: '1rem' }} />
        </Avatar>
        <Typography variant="h2" fontSize="1.25rem">
          ניהול
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {JudgingCategoryTypes.map(category => {
          const teams = unscoredTeams[category];
          return (
            <React.Fragment key={category}>
              <Grid xs={6}>
                <ExportAction event={event} path={`/rubrics/${category}`} sx={{ m: 1 }}>
                  {`ייצוא מחווני ${localizedJudgingCategory[category].name}`}
                </ExportAction>
              </Grid>
              <Grid xs={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  key={category}
                >
                  <Avatar
                    sx={{
                      bgcolor: '#fadaca',
                      color: '#d4642c',
                      width: '1.5rem',
                      height: '1.5rem',
                      mr: 1
                    }}
                  >
                    <RuleIcon sx={{ fontSize: '0.75rem' }} />
                  </Avatar>
                  <Typography variant="h2" fontSize="1.25rem">
                    <Typography>
                      {teams.length > 5 ? 'יותר מ-5 קבוצות' : teams.map(t => t.number).join(', ')}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </React.Fragment>
          );
        })}

        <Grid xs={6}>
          <ExportAction event={event} path="/scores" sx={{ m: 1 }}>
            ייצוא תוצאות זירה
          </ExportAction>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultExportPaper;
