import React from 'react';
import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Typography } from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import Grid from '@mui/material/Grid2';
import { Division, JudgingCategoryTypes } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import ExportAction from './export-action';

interface ResultExportPaperProps {
  division: WithId<Division>;
}

const ResultExportPaper: React.FC<ResultExportPaperProps> = ({ division }) => {
  return (
    (<Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
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
            <Grid size={6}>
              <ExportAction division={division} path={`/rubrics/${category}`} sx={{ m: 1 }}>
                ייצוא מחווני {localizedJudgingCategory[category].name}
              </ExportAction>
            </Grid>
          </React.Fragment>
        ))}

        <Grid size={6}>
          <ExportAction division={division} path="/scores" sx={{ m: 1 }}>
            ייצוא תוצאות זירה
          </ExportAction>
        </Grid>
      </Grid>
    </Paper>)
  );
};

export default ResultExportPaper;
