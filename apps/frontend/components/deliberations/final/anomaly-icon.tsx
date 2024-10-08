import { Tooltip } from '@mui/material';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import { DeliberationAnomaly } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';

interface AnomalyIconProps {
  anomaly: DeliberationAnomaly;
}

const AnomalyIcon: React.FC<AnomalyIconProps> = ({ anomaly }) => {
  return (
    <Tooltip
      title={`ניתן לקבוצה ניקוד ${anomaly.reason === 'low-rank' ? 'נמוך' : 'גבוה'} ביחס למחוון ${localizedJudgingCategory[anomaly.category].name}`}
      arrow
    >
      <span>
        {anomaly.reason === 'low-rank' ? (
          <KeyboardDoubleArrowDownRoundedIcon sx={{ mt: 1, color: 'red' }} />
        ) : (
          <KeyboardDoubleArrowUpRoundedIcon sx={{ mt: 1, color: 'red' }} />
        )}
      </span>
    </Tooltip>
  );
};

export default AnomalyIcon;
