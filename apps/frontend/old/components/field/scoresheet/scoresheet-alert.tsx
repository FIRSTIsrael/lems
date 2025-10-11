import { Alert } from '@mui/material';

interface ScoresheetAlertProps {
  text: string;
  severity: 'warning' | 'error';
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ScoresheetAlert: React.FC<ScoresheetAlertProps> = ({ text, severity, onClick }) => {
  const borderColors = {
    warning: '#ff9800',
    error: '#ff2f00'
  };

  const hoverColors = {
    warning: '#ffe3a6',
    error: '#ffdbd9'
  };

  return (
    <Alert
      severity="warning"
      sx={{
        fontWeight: 500,
        mb: 4,
        maxWidth: '20rem',
        mx: 'auto',
        border: `1px solid ${borderColors[severity]}`,
        transition: theme =>
          theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.standard
          }),
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: hoverColors[severity]
        }
      }}
      onClick={onClick}
    >
      {text}
    </Alert>
  );
};

export default ScoresheetAlert;
