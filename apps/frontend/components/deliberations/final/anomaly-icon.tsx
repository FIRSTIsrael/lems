import { IconButton, Tooltip } from '@mui/material';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import { DeliberationAnomaly } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
const AnomalyIconColor = '#0071e3';

interface AnomalyIconProps {
  anomaly: DeliberationAnomaly;
  redirect?: boolean;
}

const AnomalyIcon: React.FC<AnomalyIconProps> = ({ anomaly, redirect = true }) => {
  return (
    <Tooltip
      title={`ניתן לקבוצה ניקוד ${anomaly.reason === 'low-rank' ? 'נמוך' : 'גבוה'} ביחס למחוון ${localizedJudgingCategory[anomaly.category].name}`}
      arrow
    >
      <IconButton
        {...(redirect
          ? { href: `/lems/team/${anomaly.teamId}/rubric/${anomaly.category}`, target: '_blank' }
          : {})}
        sx={{ width: 26, height: 26, color: AnomalyIconColor }}
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
