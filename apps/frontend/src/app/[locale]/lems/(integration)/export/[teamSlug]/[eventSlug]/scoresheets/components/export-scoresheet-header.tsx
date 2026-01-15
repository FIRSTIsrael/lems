'use client';

import React from 'react';
import { Box, Avatar } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ExportScoresheetHeaderProps {
  teamNumber: number;
  teamName: string;
  eventName: string;
  divisionName: string;
  seasonName: string;
  round: number;
  teamLogoUrl?: string | null;
}

export const ExportScoresheetHeader: React.FC<ExportScoresheetHeaderProps> = ({
  teamNumber,
  teamName,
  eventName,
  divisionName,
  seasonName,
  round,
  teamLogoUrl
}) => {
  const t = useTranslations('pages.exports.scores');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 2,
        pb: 1,
        borderBottom: '2px solid #000',
        '@media print': {
          mb: 2,
          pb: 1
        }
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Box sx={{ fontSize: '0.7rem', color: '#666', mb: 1, lineHeight: 1.3 }}>
          {t('metadata', {
            eventName,
            divisionName,
            seasonName
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar
            variant="square"
            src={teamLogoUrl ?? '/assets/default-avatar.svg'}
            alt={`Team ${teamNumber}`}
            sx={{ width: 48, height: 48, objectFit: 'cover' }}
          />
          <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
            {t('title', {
              round,
              teamNumber,
              teamName
            })}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: '100px', height: '80px', position: 'relative', flexShrink: 0 }}>
        <Image
          src="/assets/audience-display/sponsors/fllc-horizontal.svg"
          alt="FIRST LEGO League Challenge"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
    </Box>
  );
};
