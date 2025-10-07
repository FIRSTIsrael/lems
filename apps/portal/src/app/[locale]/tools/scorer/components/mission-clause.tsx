'use client';

import React from 'react';
import { Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MissionClauseSchema } from '@lems/shared/scoresheet';
import {
  useScoresheetGeneralTranslations,
  useScoresheetClauseTranslations
} from '@lems/localization';
import { NumberInput } from '@lems/shared';
import { ensureArray } from '@lems/shared/utils';

interface ClausePickerProps<T> {
  missionId: string;
  clauseIndex: number;
  value: T | null;
  onChange: (value: T) => void;
}

const BooleanClause: React.FC<ClausePickerProps<boolean>> = ({ value, onChange }) => {
  const { yes, no } = useScoresheetGeneralTranslations();

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_e, value) => value !== null && onChange(value)}
    >
      <ToggleButton value={false} sx={{ minWidth: '80px' }}>
        {no}
      </ToggleButton>
      <ToggleButton value={true} sx={{ minWidth: '80px' }}>
        {yes}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

interface EnumClauseProps extends ClausePickerProps<string> {
  maxWidth: number;
  values: string[];
  multiSelect: boolean;
}

const EnumClause: React.FC<EnumClauseProps> = ({
  missionId,
  clauseIndex,
  value,
  onChange,
  values,
  maxWidth,
  multiSelect
}) => {
  const buttonMinWidth = `${Math.min(80, maxWidth / values.length)}px`;
  const { getLabel } = useScoresheetClauseTranslations(missionId, clauseIndex);

  return (
    <ToggleButtonGroup
      sx={{ flexWrap: 'wrap' }}
      exclusive={!multiSelect}
      value={value}
      onChange={(_e, value) => {
        if (value === null) return;
        if (multiSelect && ensureArray(value).length === 0) return;
        onChange(value);
      }}
    >
      {values.map(value => (
        <ToggleButton key={value} value={value} sx={{ minWidth: buttonMinWidth }}>
          <Typography>{getLabel(value)}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

interface NumericClauseProps extends ClausePickerProps<number> {
  min: number;
  max: number;
}

const NumericClause: React.FC<NumericClauseProps> = ({ min, max, value, onChange }) => {
  return (
    <NumberInput
      value={value}
      onChange={(e, value) => {
        if (value !== null) {
          e.preventDefault();
          onChange(value);
        }
      }}
      min={min}
      max={max}
      step={1}
    />
  );
};

interface MissionClauseProps {
  missionId: string;
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClauseSchema;
  value: string | number | boolean | null;
  setValue: (value: string | number | boolean | null) => void;
  maxWidth?: number;
}

const MissionClause: React.FC<MissionClauseProps> = ({
  missionId,
  missionIndex,
  clauseIndex,
  clause,
  value,
  setValue,
  maxWidth = 550
}) => {
  const { description } = useScoresheetClauseTranslations(missionId, clauseIndex);

  return (
    <React.Fragment key={missionIndex}>
      <Grid size={10} ml={3}>
        <Typography>{description}</Typography>
      </Grid>
      <Grid size={12} ml={3}>
        {clause.type === 'boolean' ? (
          <BooleanClause
            missionId={missionId}
            clauseIndex={clauseIndex}
            value={value as boolean | null}
            onChange={setValue}
          />
        ) : clause.type === 'enum' ? (
          <EnumClause
            missionId={missionId}
            clauseIndex={clauseIndex}
            value={value as string | null}
            onChange={setValue}
            values={clause.options || []}
            multiSelect={!!clause.multiSelect}
            maxWidth={maxWidth}
          />
        ) : (
          <NumericClause
            missionId={missionId}
            clauseIndex={clauseIndex}
            min={clause.min || 0}
            max={clause.max || 0}
            value={value as number | null}
            onChange={setValue}
          />
        )}
      </Grid>
    </React.Fragment>
  );
};

export default MissionClause;
