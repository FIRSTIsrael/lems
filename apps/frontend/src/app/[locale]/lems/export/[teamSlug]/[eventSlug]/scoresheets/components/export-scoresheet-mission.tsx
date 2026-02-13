'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  useScoresheetMissionTranslations,
  useScoresheetGeneralTranslations
} from '@lems/localization';
import { MissionSchema, ScoresheetClauseValue } from '@lems/shared/scoresheet';

interface ExportScoresheetMissionProps {
  mission: MissionSchema;
  clauses: Array<{ value: ScoresheetClauseValue }>;
  score: number;
}

export const ExportScoresheetMission: React.FC<ExportScoresheetMissionProps> = ({
  mission,
  clauses,
  score
}) => {
  const { title, description, getClauseDescription, getClauseLabel } =
    useScoresheetMissionTranslations(mission.id);
  const { yes, no } = useScoresheetGeneralTranslations();

  const getClauseValueDisplay = (clauseIndex: number) => {
    const clause = mission.clauses[clauseIndex];
    const value = clauses[clauseIndex]?.value;

    if (clause.type === 'boolean') {
      return value ? yes : no;
    } else if (clause.type === 'number') {
      return String(value ?? 0);
    } else if (clause.type === 'enum' && clause.options) {
      if (clause.multiSelect) {
        const selectedValues = value as string[] | null;
        if (!selectedValues || selectedValues.length === 0) return null;
        // Return array of React elements for multi-select
        return selectedValues.map((v, idx) => (
          <React.Fragment key={v}>
            {idx > 0 && ', '}
            {getClauseLabel(clauseIndex, v)}
          </React.Fragment>
        ));
      } else {
        const selectedValue = value as string;
        return getClauseLabel(clauseIndex, selectedValue);
      }
    }
    return '';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        border: '1px solid #2e7d32',
        borderRadius: '2px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        '@media print': {
          pageBreakInside: 'avoid',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          <Box
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px',
              px: 1,
              '@media print': {
                minWidth: '50px'
              }
            }}
          >
            <Typography fontWeight={800} fontSize="0.9rem">
              {mission.id.toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, py: 0.5, px: 1 }}>
            <Typography fontSize="0.9rem" fontWeight={600}>
              {title}
            </Typography>
          </Box>
        </Box>

        {description && (
          <Box sx={{ px: 1.5, py: 0.5 }}>
            <Typography fontSize="0.75rem" sx={{ lineHeight: 1.4 }}>
              {description}
            </Typography>
          </Box>
        )}

        <Box sx={{ px: 1.5, pb: 0.5 }}>
          {mission.clauses.map((clause, clauseIndex) => {
            const valueDisplay = getClauseValueDisplay(clauseIndex);
            return (
              <Box key={clauseIndex} sx={{ py: 0.3 }}>
                <Typography component="span" fontSize="0.75rem" sx={{ lineHeight: 1.4 }}>
                  {getClauseDescription(clauseIndex)}
                </Typography>
                {valueDisplay && (
                  <>
                    <Typography component="span" fontSize="0.75rem">
                      {' '}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.85rem',
                        color: '#d32f2f',
                        fontWeight: 'bold'
                      }}
                    >
                      {valueDisplay}
                    </Typography>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '70px',
          px: 2,
          '@media print': {
            minWidth: '60px'
          }
        }}
      >
        <Typography fontSize="1.5rem" fontWeight={600} sx={{ color: '#2e7d32' }}>
          {score}
        </Typography>
      </Box>
    </Box>
  );
};
