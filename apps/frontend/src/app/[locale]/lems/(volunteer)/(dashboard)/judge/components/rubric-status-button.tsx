'use client';

import { Button, Box, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';

export type RubricType = 'core-values' | 'innovation-project' | 'robot-design';
export type RubricStatus = 'empty' | 'in-progress' | 'completed' | 'not-judged';

interface RubricStatusButtonProps {
  type: RubricType;
  status: RubricStatus;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

const getRubricColor = (type: RubricType) => {
  switch (type) {
    case 'core-values':
      return '#e53935'; // Red
    case 'innovation-project':
      return '#1976d2'; // Blue
    case 'robot-design':
      return '#43a047'; // Green
  }
};

const getStatusIcon = (status: RubricStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={{ fontSize: '1rem' }} />;
    case 'in-progress':
      return <PendingIcon sx={{ fontSize: '1rem' }} />;
    case 'empty':
      return null;
    case 'not-judged':
    default:
      return <ErrorIcon sx={{ fontSize: '1rem' }} />;
  }
};

export const RubricStatusButton: React.FC<RubricStatusButtonProps> = ({
  type,
  status,
  label,
  onClick,
  disabled = false
}) => {
  const theme = useTheme();
  const rubricColor = getRubricColor(type);
  const statusIcon = getStatusIcon(status);
  const isCompleted = status === 'completed';

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outlined"
      size="small"
      sx={
        {
          minWidth: 0,
          px: 1.5,
          py: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          borderRadius: 1.5,
          borderWidth: '2px',
          borderStyle: 'solid',
          backgroundColor: isCompleted ? rubricColor : 'transparent',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(disabled
            ? {
                color: theme.palette.action.disabled,
                borderColor: theme.palette.action.disabled,
                opacity: 0.5
              }
            : {
                borderColor: rubricColor,
                color: isCompleted ? 'white' : rubricColor,
                '&:hover': {
                  backgroundColor: rubricColor,
                  color: 'white',
                  boxShadow: `0 4px 12px ${rubricColor}40`,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              })
        } as const
      }
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: 0.5
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            lineHeight: 1,
            textAlign: 'center',
            minWidth: 0,
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        >
          {label}
        </Typography>
        {statusIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center', lineHeight: 1, color: 'currentColor' }}>
            {statusIcon}
          </Box>
        )}
      </Box>
    </Button>
  );
};
