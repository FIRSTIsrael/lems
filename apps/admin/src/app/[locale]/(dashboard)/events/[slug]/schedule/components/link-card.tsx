'use client';

import React, { ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Box, CardActionArea } from '@mui/material';

interface LinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  preserveDivisionId?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  href,
  title,
  description,
  icon,
  preserveDivisionId = false
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    let finalHref = href;

    if (preserveDivisionId) {
      const divisionId = searchParams.get('division');
      if (divisionId) {
        const separator = href.includes('?') ? '&' : '?';
        finalHref = `${href}${separator}division=${divisionId}`;
      }
    }

    router.push(finalHref);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={handleClick} sx={{ height: '100%' }}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 3,
            height: '100%'
          }}
        >
          <Box sx={{ mb: 2, color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
