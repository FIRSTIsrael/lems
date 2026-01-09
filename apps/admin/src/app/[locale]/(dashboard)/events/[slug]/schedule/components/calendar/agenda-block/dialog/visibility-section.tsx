'use client';

import React from 'react';
import { FormControl, FormLabel, RadioGroup, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AgendaBlockVisibility } from '../../calendar-types';
import { VisibilityOption } from './visibility-option';

interface VisibilitySectionProps {
  value: AgendaBlockVisibility;
  onChange: (value: AgendaBlockVisibility) => void;
}

export const VisibilitySection: React.FC<VisibilitySectionProps> = ({ value, onChange }) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  const theme = useTheme();

  return (
    <FormControl component="fieldset">
      <FormLabel
        component="legend"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 2
        }}
      >
        {t('visibility')}
      </FormLabel>

      <RadioGroup
        value={value}
        onChange={e => onChange(e.target.value as AgendaBlockVisibility)}
        sx={{ gap: 1.5 }}
      >
        <VisibilityOption
          value="public"
          isSelected={value === 'public'}
          label={t('public')}
          description={t('description-public')}
          onChange={onChange}
        />

        <VisibilityOption
          value="field"
          isSelected={value === 'field'}
          label={t('field')}
          description={t('description-field')}
          onChange={onChange}
        />

        <VisibilityOption
          value="judging"
          isSelected={value === 'judging'}
          label={t('judging')}
          description={t('description-judging')}
          onChange={onChange}
        />

        <VisibilityOption
          value="teams"
          isSelected={value === 'teams'}
          label={t('teams')}
          description={t('description-teams')}
          onChange={onChange}
        />
      </RadioGroup>
    </FormControl>
  );
};
