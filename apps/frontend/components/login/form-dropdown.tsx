import { FormControl, InputLabel, Select, SelectProps } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormDropdownProps extends SelectProps<any> {
  id: string;
  children: React.ReactNode;
  label: string;
}

const FormDropdown: React.FC<FormDropdownProps> = ({ id, children, label, ...props }) => {
  return (
    <FormControl fullWidth>
      <InputLabel id={id}>{label}</InputLabel>
      <Select labelId={id} label={label} {...props}>
        {children}
      </Select>
    </FormControl>
  );
};

export default FormDropdown;
