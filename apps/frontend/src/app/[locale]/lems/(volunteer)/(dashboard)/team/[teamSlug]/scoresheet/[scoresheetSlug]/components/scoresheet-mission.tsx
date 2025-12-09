'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Paper, Stack, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useScoresheetMissionTranslations } from '@lems/localization';
import { MissionSchema } from '@lems/shared/scoresheet';
import { useScoresheet } from '../scoresheet-context';
import MissionClause from './mission-clause';

interface ScoresheetMissionProps {
  missionIndex: number;
  mission: MissionSchema;
  src: string;
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({ missionIndex, mission, src }) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scoresheet } = useScoresheet();
  const { title, description, remarks } = useScoresheetMissionTranslations(mission.id);
  const [missionWidth, setMissionWidth] = useState(0);

  useLayoutEffect(() => {
    setMissionWidth(ref.current?.offsetWidth || 0);
  }, []);

  const missionData = scoresheet.data?.missions[mission.id];
  const clauses = missionData?.clauses ?? [];

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
          const clauseValue = clauses[index];
          const value = clauseValue?.value ?? null;

          return (
            <MissionClause
              key={index}
              missionId={mission.id}
              missionIndex={missionIndex}
              clauseIndex={index}
              clause={clause}
              maxWidth={missionWidth * 0.9}
              value={value}
              disabled={true}
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
