import React from 'react';
import { LocalizedMission, MissionClauseSchema } from '@lems/season';
import { ensureArray } from '@lems/utils/arrays';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Grid from '@mui/material/Grid';
import Markdown from 'react-markdown';
import CustomNumberInput from './number-input';

interface ClausePickerProps<T> {
  value: T | null;
  onChange: (value: T) => void;
}

const BooleanClause: React.FC<ClausePickerProps<boolean>> = ({ value, onChange }) => {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_e, value) => value !== null && onChange(value)}
    >
      <ToggleButton value={false} sx={{ minWidth: '80px' }}>
        לא
      </ToggleButton>
      <ToggleButton value={true} sx={{ minWidth: '80px' }}>
        כן
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

interface EnumClauseProps extends ClausePickerProps<string> {
  maxWidth: number;
  labels: string[];
  values: string[];
  multiSelect: boolean;
}

const EnumClause: React.FC<EnumClauseProps> = ({
  value,
  onChange,
  labels,
  values,
  maxWidth,
  multiSelect
}) => {
  const buttonMinWidth = `${Math.min(80, maxWidth / labels.length)}px`;

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
      {labels.map((label, index) => (
        <ToggleButton key={label} value={values[index] ?? ''} sx={{ minWidth: buttonMinWidth }}>
          {label}
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
    <CustomNumberInput
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
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClauseSchema;
  value: string | number | boolean | null;
  setValue: (value: string | number | boolean | null) => void;
  localizedMission: LocalizedMission;
  maxWidth?: number;
}

const MissionClause: React.FC<MissionClauseProps> = ({
  missionIndex,
  clauseIndex,
  clause,
  value,
  setValue,
  localizedMission,
  maxWidth = 550
}) => {
  return (
    <React.Fragment key={missionIndex}>
      <Grid size={10} ml={3}>
        <Markdown>{localizedMission.clauses[clauseIndex].description}</Markdown>
      </Grid>
      <Grid size={12} ml={3}>
        {clause.type === 'boolean' ? (
          <BooleanClause value={value as boolean | null} onChange={setValue} />
        ) : clause.type === 'enum' ? (
          <EnumClause
            value={value as string | null}
            onChange={setValue}
            labels={localizedMission.clauses[clauseIndex].labels || []}
            values={clause.options || []}
            multiSelect={!!clause.multiSelect}
            maxWidth={maxWidth}
          />
        ) : (
          <NumericClause
            min={clause.min ?? 0}
            max={clause.max ?? 0}
            value={value as number | null}
            onChange={setValue}
          />
        )}
      </Grid>
    </React.Fragment>
  );
};

export default MissionClause;
