import { SvgIconProps } from '@mui/material';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import CVFieldCheckedIcon from '../../icons/cv-field-checked-icon';
import CVFieldUncheckedIcon from '../../icons/cv-field-unchecked-icon';

interface Props extends SvgIconProps {
  checked: boolean;
  isCoreValuesField: boolean;
}

const RubricRadioIcon = ({ checked, isCoreValuesField = false, ...props }: Props) => {
  if (isCoreValuesField) {
    return checked ? <CVFieldCheckedIcon {...props} /> : <CVFieldUncheckedIcon {...props} />;
  }
  return checked ? <CheckedIcon {...props} /> : <UncheckedIcon {...props} />;
};

export default RubricRadioIcon;
