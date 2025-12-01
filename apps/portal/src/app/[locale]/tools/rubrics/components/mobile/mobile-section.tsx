'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Typography,
  Stack,
  lighten
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { useRubricsTranslations } from '@lems/localization';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { MobileFieldSection } from './mobile-field-section';

interface MobileSectionProps {
  category: JudgingCategory;
  sectionId: string;
  fields: { id: string; coreValues?: boolean }[];
  disabled?: boolean;
}

export const MobileSection: React.FC<MobileSectionProps> = ({
  category,
  sectionId,
  fields,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(true);
  const { getSectionTitle } = useRubricsTranslations(category);

  const color = getRubricColor(category);
  const background = lighten(color, 0.9);

  return (
    <Card
      sx={{
        mb: 3,
        borderTop: `3px solid ${color}`,
        boxShadow: 1,
        backgroundColor: `${background}10`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700} sx={{ color: color }}>
            {getSectionTitle(sectionId)}
          </Typography>
        }
        sx={{
          backgroundColor: `${background}25`,
          borderBottom: `1px solid ${background}40`
        }}
        action={
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            {fields.map(field => (
              <MobileFieldSection
                key={field.id}
                category={category}
                sectionId={sectionId}
                fieldId={field.id}
                coreValues={field.coreValues}
                disabled={disabled}
              />
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};
