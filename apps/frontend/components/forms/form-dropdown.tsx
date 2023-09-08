import { FormControl, InputLabel, Select, SelectProps } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props extends SelectProps<any> {
  id: string;
  children: React.ReactNode;
}

const FormDropdown: React.FC<Props> = ({ id, children, ...props }) => {
  return (
    <FormControl fullWidth>
      <InputLabel id={id}>תפקיד</InputLabel>
      <Select labelId={id} {...props}>
        {children}
      </Select>
    </FormControl>
  );
};

export default FormDropdown;
