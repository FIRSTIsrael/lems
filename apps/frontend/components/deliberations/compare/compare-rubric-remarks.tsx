import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { JudgingCategoryTypes } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareRubricRemarksProps {
  teamId: ObjectId;
}

const CompareRubricRemarks: React.FC<CompareRubricRemarksProps> = ({ teamId }) => {
  const { category, rubrics } = useContext(CompareContext);
  const categories = category ? [category] : [...JudgingCategoryTypes];

  return (
    <Grid container>
      <Grid xs={3.5}></Grid>
      <Grid xs={4.25}>
        <Typography fontWeight={600} gutterBottom>
          לשימור
        </Typography>
      </Grid>
      <Grid xs={4.25}>
        <Typography fontWeight={600} gutterBottom>
          לשיפור
        </Typography>
      </Grid>
      {categories.map(c => {
        const rubric = rubrics.find(r => r.teamId === teamId && r.category === c);

        return (
          <>
            <Grid xs={3.5}>
              <Typography fontWeight={600} gutterBottom>
                {localizedJudgingCategory[c].name}
              </Typography>
            </Grid>
            <Grid container xs={8.5}>
              <Grid xs={6}>
                <Typography align="left">{rubric?.data?.feedback.greatJob}</Typography>
              </Grid>
              <Grid xs={6}>
                <Typography align="left">{rubric?.data?.feedback.thinkAbout}</Typography>
              </Grid>
            </Grid>
          </>
        );
      })}
    </Grid>
  );
};

export default CompareRubricRemarks;
