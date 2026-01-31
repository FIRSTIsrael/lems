import React from 'react';
import { Card, CardActionArea, Stack, Box, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AddIntegrationCardProps {
  onClick: () => void;
}

const AddIntegrationCard: React.FC<AddIntegrationCardProps> = ({ onClick }) => {
  return (
    <Tooltip title="Add integration">
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 1
          }
        }}
        variant="outlined"
      >
        <CardActionArea
          onClick={onClick}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            minHeight: 200,
            height: '100%'
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ height: '100%', width: '100%' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                color: 'text.secondary',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <AddIcon sx={{ fontSize: 28, color: 'inherit' }} />
            </Box>
          </Stack>
        </CardActionArea>
      </Card>
    </Tooltip>
  );
};

export default AddIntegrationCard;
