import { closeSnackbar, SnackbarKey } from 'notistack';
import { IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import React from 'react';

interface SnackbarCloseButtonProps {
  snackbarId?: SnackbarKey;
}

const SnackbarCloseButton: React.FC<SnackbarCloseButtonProps> = ({ snackbarId }) => {
  return (
    <IconButton
      onClick={() => closeSnackbar(snackbarId)}
      sx={{ color: '#fff', position: 'absolute', right: 5 }}
    >
      <CloseRoundedIcon />
    </IconButton>
  );
};

export default SnackbarCloseButton;
