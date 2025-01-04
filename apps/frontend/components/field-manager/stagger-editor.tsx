import { Paper, Typography } from '@mui/material';

interface StaggerEditorProps {}

const StaggerEditor: React.FC<StaggerEditorProps> = () => {
  return (
    <Paper sx={{ p: 2, my: 2 }}>
      <Typography variant="h2" mb={3}>
        עריכה מהירה
      </Typography>
    </Paper>
  );
};

export default StaggerEditor;
