import { SvgIconProps } from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import CvFieldCheckedIcon from '../../icons/CvFieldCheckedIcon';
import CvFieldUncheckedIcon from '../../icons/CvFieldUncheckedIcon';

interface Props extends SvgIconProps {
  checked: boolean;
  isCoreValuesField: boolean;
}

const RubricRadioIcon = ({ checked, isCoreValuesField = false, ...props }: Props) => {
  if (isCoreValuesField) {
    return checked ? <CvFieldCheckedIcon {...props} /> : <CvFieldUncheckedIcon {...props} />;
  }
  return checked ? <CheckedIcon {...props} /> : <UncheckedIcon {...props} />;
};

export default RubricRadioIcon;
