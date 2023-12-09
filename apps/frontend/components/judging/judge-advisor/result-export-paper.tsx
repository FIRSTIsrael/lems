import { useState } from 'react';
import { WithId } from 'mongodb';
import { Button, Paper, Box, Avatar, Typography } from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, JudgingCategory, Team } from '@lems/types';
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

  const fetchUnscoredTeams = () => {
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
  };

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
        <Grid xs={6}>
          <ExportAction event={event} path="/rubrics/core-values" sx={{ m: 1 }}>
            ייצוא מחווני ערכי הליבה
          </ExportAction>
        </Grid>
        <Grid xs={6}>
          <ExportAction event={event} path="/rubrics/innovation-project" sx={{ m: 1 }}>
            ייצוא מחווני פרויקט החדשנות
          </ExportAction>
        </Grid>
        <Grid xs={6}>
          <ExportAction event={event} path="/rubrics/robot-design" sx={{ m: 1 }}>
            ייצוא מחווני תכנון הרובוט
          </ExportAction>
        </Grid>
        <Grid xs={6}>
          <ExportAction event={event} path="/scores" sx={{ m: 1 }}>
            ייצוא תוצאות זירה
          </ExportAction>
        </Grid>
        <Grid xs={6}>
          <Button variant="contained" onClick={() => fetchUnscoredTeams()}>
            בדיקת מוכנות לייצוא
          </Button>
        </Grid>
        <Grid xs={6}>
          {Object.entries(unscoredTeams).map(entry => {
            const category = entry[0] as JudgingCategory;
            const teams = entry[1];
            if (teams.length === 0) return;
            return (
              <Typography key={category}>{`${
                localizedJudgingCategory[category].name
              }: ${JSON.stringify(teams.map(t => t.number))}`}</Typography>
            );
          })}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultExportPaper;
