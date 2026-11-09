import { CheckCircle, CircleOutlined, Edit, Verified, Lock } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricStatus } from '@lems/database';
import type { Edition } from '../edition';
import { getRubricColors } from './rubric-colors';

export const getRubricColor = (category: JudgingCategory, edition: Edition) =>
  getRubricColors(edition, category).main;

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
