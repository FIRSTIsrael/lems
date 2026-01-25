'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, Grid, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMutation } from '@apollo/client/react';
import { useScoresheetMissionTranslations } from '@lems/localization';
import { MissionSchema, ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { useScoresheet } from '../scoresheet-context';
import { useEvent } from '../../../../../../components/event-context';
import { UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION } from '../graphql';
import { MissionClause } from './mission-clause';

interface ScoresheetMissionProps {
  missionIndex: number;
  mission: MissionSchema;
  src: string;
  missionErrors?: string[];
  disabled?: boolean;
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({
  missionIndex,
  mission,
  src,
  missionErrors,
  disabled = false
}) => {
  const t = useTranslations('layouts.scoresheet');
  const theme = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scoresheet } = useScoresheet();
  const { currentDivision } = useEvent();
  const { title, description, remarks, getError } = useScoresheetMissionTranslations(mission.id);
  const [missionWidth, setMissionWidth] = useState(0);

  const [updateMissionClause] = useMutation(UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION, {
    onError: error => {
      console.error('Failed to update mission clause:', error);
      toast.error(t('error-failed-to-update'));
    }
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setMissionWidth(element.offsetWidth);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const missionData = scoresheet.data?.missions[mission.id];

  const handleClauseChange = async (clauseIndex: number, newValue: ScoresheetClauseValue) => {
    if (newValue === null) return; // Don't send null values

    await updateMissionClause({
      variables: {
        divisionId: currentDivision.id,
        scoresheetId: scoresheet.id,
        missionId: mission.id,
        clauseIndex,
        value: newValue
      }
    });
  };

  return (
    <Grid component={Paper} container pb={2} id={mission.id}>
      <Grid container size={{ xs: 12, md: 8 }} ref={ref}>
        <Grid
          py={1}
          size={2}
          alignSelf="flex-start"
          bgcolor={theme.palette.primary.main}
          borderRadius="6px 0 0 0"
          textAlign="center"
        >
          <Typography fontSize="1.5rem" fontWeight={600} sx={{ color: '#FFF' }}>
            {mission.id.toUpperCase()}
          </Typography>
        </Grid>
        <Grid size={10} pt={1}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontSize="1.5rem" fontWeight={600} pl={4}>
              {title}
            </Typography>
            {mission.noEquipment && (
              <Image
                src={'/assets/scoresheet/no-equipment.svg'}
                width={35}
                height={35}
                alt="No equipment constraint"
              />
            )}
          </Stack>
        </Grid>
        {description && (
          <Grid size={12}>
            <Typography fontSize="1rem" fontWeight={600} mt={1} ml={2}>
              {description}
            </Typography>
          </Grid>
        )}
        {mission.clauses.map((clause, index) => {
          const value = missionData?.[index] ?? null;

          return (
            <MissionClause
              key={index}
              missionId={mission.id}
              missionIndex={missionIndex}
              clauseIndex={index}
              clause={clause}
              maxWidth={missionWidth * 0.9}
              value={value}
              disabled={disabled}
              onChange={newValue => handleClauseChange(index, newValue)}
            />
          );
        })}
        <Grid size={12} mt={2}>
          {remarks.map((remark, index) => (
            <Typography
              key={`${mission.id}-remark-${index}`}
              pl={3}
              fontSize="1rem"
              color="primary"
              sx={{ fontStyle: 'italic' }}
            >
              {remark}
            </Typography>
          ))}
        </Grid>

        {missionErrors && missionErrors.length > 0 && (
          <Grid size={12} mt={2} ml={3}>
            <Stack spacing={1}>
              {missionErrors.map(errorId => (
                <Alert key={errorId} severity="error">
                  <Typography fontSize="0.875rem">{getError(errorId)}</Typography>
                </Alert>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
      <Grid borderRadius={8} p={2} size={{ xs: 0, md: 4 }} display={{ xs: 'none', md: 'block' }}>
        <Image
          src={src}
          width={0}
          height={0}
          sizes="100vw"
          alt={`Mission photo ${mission.id}`}
          style={{
            width: '100%',
            height: 'auto'
          }}
        />
      </Grid>
    </Grid>
  );
};

export default ScoresheetMission;
