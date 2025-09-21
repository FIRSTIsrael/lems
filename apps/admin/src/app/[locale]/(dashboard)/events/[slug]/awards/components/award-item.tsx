'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useTranslations } from 'next-intl';
import { Paper, Box, Typography, IconButton, Stack, alpha, useTheme } from '@mui/material';
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { Award, MANDATORY_AWARDS, AWARD_LIMITS } from '@lems/types/fll';
import { NumberInput } from '@lems/shared';
import { useAwards } from './awards-context';
import {
  useLocaleAwardDescription,
  useLocaleAwardName
} from '../../../../../../hooks/localization';

interface AwardItemProps {
  award: Award;
  index: number;
}

export function AwardItem({ award, index }: AwardItemProps) {
  const theme = useTheme();
  const t = useTranslations('pages.events.awards.editor');
  const getAwardName = useLocaleAwardName();
  const getAwardDescription = useLocaleAwardDescription();
  const { schema, updateAwardCount, removeAward } = useAwards();

  const isMandatory = (MANDATORY_AWARDS as readonly string[]).includes(award);
  const awardData = schema[award];
  const maxCount = AWARD_LIMITS[award];
  const isUnlimited = maxCount === -1;

  const handleCountChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    updateAwardCount(award, value);
  };

  const handleRemove = () => {
    if (!isMandatory) {
      removeAward(award);
    }
  };

  return (
    <Draggable draggableId={award} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={snapshot.isDragging ? 4 : 1}
          sx={{
            p: 2,
            mb: 1,
            border: snapshot.isDragging
              ? `2px solid ${theme.palette.primary.main}`
              : '1px solid transparent',
            backgroundColor: snapshot.isDragging
              ? alpha(theme.palette.primary.main, 0.05)
              : 'background.paper',
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': {
              elevation: 2,
              backgroundColor: alpha(theme.palette.action.hover, 0.04)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              {...provided.dragHandleProps}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                color: 'text.secondary',
                '&:active': {
                  cursor: 'grabbing'
                }
              }}
            >
              <DragIcon />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {getAwardName(award)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden' }}>
                {getAwardDescription(award)}
              </Typography>
            </Box>

            <NumberInput
              min={1}
              max={isUnlimited ? undefined : maxCount}
              value={awardData?.count || 0}
              onChange={(_, value) => handleCountChange(value)}
              helperText={
                isUnlimited ? t('limits.unlimited') : t('limits.maximum', { count: maxCount })
              }
            />

            {/* Remove Button */}
            <Box>
              {isMandatory ? (
                <IconButton disabled>
                  <LockIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={handleRemove}
                  color="error"
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1)
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Stack>
        </Paper>
      )}
    </Draggable>
  );
}
