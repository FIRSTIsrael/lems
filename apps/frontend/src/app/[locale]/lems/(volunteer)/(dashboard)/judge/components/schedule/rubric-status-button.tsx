'use client';

import { Box, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import EditIcon from '@mui/icons-material/Edit';

export type RubricType = 'core-values' | 'innovation-project' | 'robot-design';
export type RubricStatus = 'empty' | 'in-progress' | 'completed';

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
      return '#d32f2f';
    case 'innovation-project':
      return '#1976d2';
    case 'robot-design':
      return '#388e3c';
  }
};

const getStatusIcon = (status: RubricStatus, color: string) => {
  const iconStyle = { fontSize: '1.1rem', color };
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={iconStyle} />;
    case 'in-progress':
      return <EditIcon sx={iconStyle} />;
    case 'empty':
    default:
      return <CircleOutlinedIcon sx={{ ...iconStyle, opacity: 0.4 }} />;
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
  const statusIcon = getStatusIcon(status, rubricColor);
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in-progress';

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        backgroundColor:
          isCompleted || isInProgress
            ? theme.palette.mode === 'dark'
              ? `${rubricColor}15`
              : `${rubricColor}08`
            : 'transparent',
        border: '1.5px solid',
        borderColor: isCompleted || isInProgress ? rubricColor : theme.palette.divider,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '140px',
        opacity: disabled ? 0.5 : 1,
        ...(!disabled && {
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? `${rubricColor}25` : `${rubricColor}12`,
            borderColor: rubricColor,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${rubricColor}20`
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        })
      }}
    >
      {statusIcon}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: isCompleted || isInProgress ? rubricColor : theme.palette.text.secondary,
          flex: 1,
          textAlign: 'left'
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};
