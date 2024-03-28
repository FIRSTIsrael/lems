import { useLayoutEffect, useRef, useState } from 'react';
import {
  LocalizedMission,
  MissionSchema,
  MissionClauseSchema,
  localizedScoresheet
} from '@lems/season';
import {
  Box,
  Paper,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import { FastField, Field, FieldProps } from 'formik';
import Image from 'next/image';
import Markdown from 'react-markdown';
import CustomNumberInput from './number-input';
interface MissionClauseProps {
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClauseSchema;
  localizedMission: LocalizedMission;
  readOnly: boolean;
  maxWidth?: number;
}

const MissionClause: React.FC<MissionClauseProps> = ({
  missionIndex,
  clauseIndex,
  clause,
  localizedMission,
  readOnly,
  maxWidth = 550
}) => {
  return (
    <ThemeProvider
      theme={outerTheme => ({
        ...outerTheme,
        components: {
          MuiToggleButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  '&:hover': {
                    color: '#fff',
                    backgroundColor: '#81c784'
                  },
                  color: '#fff',
                  backgroundColor: '#388e3c'
                }
              }
            }
          }
        }
      })}
    >
      <Grid xs={10} mt={2} ml={3}>
        <Markdown>{localizedMission.clauses[clauseIndex].description}</Markdown>
      </Grid>
      <Grid xs={12} ml={3}>
        {clause.type === 'boolean' ? (
          <Field name={`missions[${missionIndex}].clauses[${clauseIndex}].value`}>
            {({ field, form }: FieldProps) => (
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onChange={(_e, value) => value !== null && form.setFieldValue(field.name, value)}
                disabled={readOnly}
              >
                <ToggleButton value={false} sx={{ minWidth: '80px' }}>
                  לא
                </ToggleButton>
                <ToggleButton value={true} sx={{ minWidth: '80px' }}>
                  כן
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Field>
        ) : clause.type === 'enum' ? (
          <Field name={`missions[${missionIndex}].clauses[${clauseIndex}].value`}>
            {({ field, form }: FieldProps) => {
              const memberCount = localizedMission.clauses[clauseIndex].labels?.length || 0;
              const buttonMinWidth = `${Math.min(80, maxWidth / memberCount)}px`;

              return (
                <ToggleButtonGroup
                  exclusive
                  value={field.value}
                  onChange={(_e, value) => value !== null && form.setFieldValue(field.name, value)}
                  disabled={readOnly}
                >
                  {localizedMission.clauses[clauseIndex].labels?.map((label, index) => (
                    <ToggleButton
                      key={label}
                      value={clause.options ? clause.options[index] : ''}
                      sx={{ minWidth: buttonMinWidth }}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              );
            }}
          </Field>
        ) : (
          <FastField name={`missions[${missionIndex}].clauses[${clauseIndex}].value`}>
            {({ field, form }: FieldProps) => (
              <CustomNumberInput
                min={clause.min}
                max={clause.max}
                {...field}
                value={field.value}
                onChange={(e, value) => {
                  if (value !== null) {
                    e.preventDefault();
                    form.setFieldValue(field.name, value);
                  }
                }}
                disabled={readOnly}
              />
            )}
          </FastField>
        )}
      </Grid>
    </ThemeProvider>
  );
};

interface ScoresheetMissionProps {
  missionIndex: number;
  mission: MissionSchema;
  src: string;
  errors?: Array<{ id: string; description: string }>;
  readOnly: boolean;
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({
  missionIndex,
  mission,
  src,
  errors = [],
  readOnly
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [missionWidth, setMissionWidth] = useState(0);

  useLayoutEffect(() => {
    setMissionWidth(ref.current?.offsetWidth || 0);
  }, []);

  const localizedMission = localizedScoresheet.missions.find(m => m.id === mission.id);
  return (
    localizedMission && (
      <Grid
        component={Paper}
        container
        spacing={0}
        pb={2}
        id={mission.id}
        sx={{ scrollMarginTop: 300 }}
      >
        <Grid container xs={8} spacing={0} ref={ref}>
          <Grid
            py={1}
            xs={2}
            alignSelf="flex-start"
            bgcolor={errors.length > 0 ? '#f44336' : '#388e3c'}
            borderRadius="8px 0 0 0"
            textAlign="center"
          >
            <Typography fontSize="1.5rem" fontWeight={600} color="#fff">
              {mission.id.toUpperCase()}
            </Typography>
          </Grid>
          <Grid xs={6} pt={1}>
            <Typography fontSize="1.5rem" fontWeight={600} pl={4}>
              {localizedMission.title}
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography fontSize="1rem">{localizedMission.description}</Typography>
          </Grid>
          {mission.clauses.map((clause, index) => (
            <MissionClause
              key={index}
              missionIndex={missionIndex}
              clauseIndex={index}
              clause={clause}
              localizedMission={localizedMission}
              readOnly={readOnly}
              maxWidth={missionWidth * 0.9}
            />
          ))}
          <Grid xs={12} mt={2}>
            {localizedMission.remarks?.map(remark => (
              <Typography
                key={remark}
                pl={3}
                fontSize="1rem"
                color="primary"
                sx={{ fontStyle: 'italic' }}
              >
                {remark}
              </Typography>
            ))}
          </Grid>
          {errors.length > 0 &&
            errors.map(e => (
              <Grid key={e?.id} xs={12} mt={2}>
                <Typography pl={3} fontSize="1rem" color="error" fontWeight={700}>
                  {e?.description}
                </Typography>
              </Grid>
            ))}
        </Grid>
        <Grid component={Box} borderRadius={8} p={2} xs={4}>
          <Image
            src={src}
            width={0}
            height={0}
            sizes="100vw"
            alt={`תמונה של משימה ${mission.id}`}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: 'auto'
            }}
          />
        </Grid>
      </Grid>
    )
  );
};

export default ScoresheetMission;
