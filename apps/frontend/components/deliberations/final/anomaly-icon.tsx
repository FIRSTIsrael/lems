import { IconButton, Tooltip } from '@mui/material';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import { DeliberationAnomaly, JudgingCategory } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';

interface AnomalyIconProps {
  anomaly: DeliberationAnomaly;
}

const AnomalyIcon: React.FC<AnomalyIconProps> = ({ anomaly }) => {
  const categoryColors: Record<JudgingCategory, string> = {
    'innovation-project': '#5E82BF',
    'robot-design': '#64AF75',
    'core-values': '#E4928B'
  };
  return (
    <Tooltip
      title={`ניתן לקבוצה ניקוד ${anomaly.reason === 'low-rank' ? 'נמוך' : 'גבוה'} ביחס למחוון ${localizedJudgingCategory[anomaly.category].name}`}
      arrow
    >
      <IconButton
        href={`/lems/team/${anomaly.teamId}/rubric/${anomaly.category}`}
        target="_blank"
        sx={{ width: 26, height: 26, color: categoryColors[anomaly.category] }}
      >
        {anomaly.reason === 'low-rank' ? (
          <KeyboardDoubleArrowDownRoundedIcon />
        ) : (
          <KeyboardDoubleArrowUpRoundedIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default AnomalyIcon;
