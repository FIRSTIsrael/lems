import React from 'react';
import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Typography } from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, JudgingCategoryTypes } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import ExportAction from './export-action';

interface ResultExportPaperProps {
  division: WithId<Event>;
}

const ResultExportPaper: React.FC<ResultExportPaperProps> = ({ division }) => {
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
        {JudgingCategoryTypes.map(category => (
          <React.Fragment key={category}>
            <Grid xs={6}>
              <ExportAction division={division} path={`/rubrics/${category}`} sx={{ m: 1 }}>
                ייצוא מחווני {localizedJudgingCategory[category].name}
              </ExportAction>
            </Grid>
          </React.Fragment>
        ))}

        <Grid xs={6}>
          <ExportAction division={division} path="/scores" sx={{ m: 1 }}>
            ייצוא תוצאות זירה
          </ExportAction>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultExportPaper;
