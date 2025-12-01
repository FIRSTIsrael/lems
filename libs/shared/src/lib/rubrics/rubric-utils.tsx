import { CheckCircle, CircleOutlined, Edit, Verified, Lock } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricStatus } from '@lems/database';

export const getRubricColor = (category: JudgingCategory) => {
  switch (category) {
    case 'core-values':
      return '#d32f2f';
    case 'innovation-project':
      return '#1976d2';
    case 'robot-design':
      return '#388e3c';
  }
};

export const getRubricIcon = (status: RubricStatus, color: string) => {
  const iconStyle = { fontSize: '1.1rem', color };

  switch (status) {
    case 'completed':
      return <Verified sx={iconStyle} />;
    case 'draft':
      return <Edit sx={iconStyle} />;
    case 'locked':
      return <Lock sx={iconStyle} />;
    case 'approved':
      return <CheckCircle sx={iconStyle} />;
    case 'empty':
    default:
      return <CircleOutlined sx={{ ...iconStyle, opacity: 0.4 }} />;
  }
};
