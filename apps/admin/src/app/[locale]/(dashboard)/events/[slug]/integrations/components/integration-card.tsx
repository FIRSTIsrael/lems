'use client';

import Image from 'next/image';
import { Card, CardActionArea, Stack, Typography, Box, Avatar } from '@mui/material';

interface IntegrationCardProps {
  id: string;
  name: string;
  icon?: React.ReactElement;
  logo?: string;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  disabled?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  icon,
  logo,
  isSelected = false,
  onClick,
  disabled = false
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        '&:hover': disabled
          ? {}
          : {
              boxShadow: 3,
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
      }}
      variant={isSelected ? 'elevation' : 'outlined'}
    >
      <CardActionArea
        onClick={() => !disabled && onClick?.(id)}
        disabled={disabled}
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
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 2,
              backgroundColor: 'action.hover',
              position: 'relative'
            }}
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                fill
                sizes="64px"
                style={{
                  objectFit: 'contain',
                  padding: '8px'
                }}
              />
            ) : icon ? (
              <Box sx={{ color: 'primary.main' }}>{icon}</Box>
            ) : (
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>?</Avatar>
            )}
          </Box>

          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              color: 'text.primary'
            }}
          >
            {name}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
};
