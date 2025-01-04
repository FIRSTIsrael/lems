import { Paper, Typography } from '@mui/material';

interface StaggerEditorProps {}

const StaggerEditor: React.FC<StaggerEditorProps> = () => {
  /* <Typography>Staggered match editor</Typography>
        <Typography>Show loaded (or next not started) +2 next matches</Typography>
        <Typography>Arrows between rows to shift teams to later /earlier matches</Typography>
        <Typography>Merge button that will merge loaded+next and complete loaded</Typography> */

  return (
    <Paper sx={{ p: 2, my: 2 }}>
      <Typography variant="h2" mb={3}>
        עריכה מהירה
      </Typography>
    </Paper>
  );
};

export default StaggerEditor;
