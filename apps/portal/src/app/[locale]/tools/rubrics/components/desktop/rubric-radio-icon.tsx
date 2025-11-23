import { SvgIconProps } from '@mui/material';
import {
  CircleOutlined as UncheckedIcon,
  TaskAltRounded as CheckedIcon
} from '@mui/icons-material';
import { CoreValuesFieldCheckedIcon, CoreValuesFieldUncheckedIcon } from '@lems/shared/icons';

interface RubricRadioIconProps extends SvgIconProps {
  checked: boolean;
  isCoreValues?: boolean;
}

export const RubricRadioIcon: React.FC<RubricRadioIconProps> = ({
  checked,
  isCoreValues = false,
  ...props
}) => {
  if (isCoreValues) {
    return checked ? (
      <CoreValuesFieldCheckedIcon {...props} />
    ) : (
      <CoreValuesFieldUncheckedIcon {...props} />
    );
  }

  return checked ? <CheckedIcon {...props} /> : <UncheckedIcon {...props} />;
};
