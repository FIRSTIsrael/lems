'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RichText } from '@lems/shared/locale';
import { MissionSchema } from '@lems/shared/scoresheet';
import NoEquipmentImage from '../../../../../../public/assets/scoresheet/no-equipment.svg';
import MissionClause from './mission-clause';
import { useMission } from './mission-context';

interface ScoresheetMissionProps {
  missionIndex: number;
  mission: MissionSchema;
  src: string;
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({ missionIndex, mission, src }) => {
  const t = useTranslations(`shared.scoresheet.missions.${mission.id}`);
  const theme = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const { mission: missionData, errors, updateClause } = useMission(missionIndex);
  const [missionWidth, setMissionWidth] = useState(0);

  useLayoutEffect(() => {
    setMissionWidth(ref.current?.offsetWidth || 0);
  }, []);

  const getRemarks = () => {
    const remarks = [];
    let index = 0;
    while (t.has(`remarks.${index}`)) {
      remarks.push(t(`remarks.${index}`));
      index++;
    }
    return remarks;
  };

  return (
    <Grid component={Paper} container pb={2} id={mission.id}>
      <Grid container size={{ xs: 12, md: 8 }} ref={ref}>
        <Grid
          py={1}
          size={2}
          alignSelf="flex-start"
          bgcolor={errors.length > 0 ? theme.palette.error.main : theme.palette.primary.main}
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
              {t('title')}
            </Typography>
            {mission.noEquipment && (
              <Image src={NoEquipmentImage} width={35} height={35} alt="No equipment constraint" />
            )}
          </Stack>
        </Grid>
        {t.has('description') && (
          <Grid size={12}>
            <Typography fontSize="1rem" fontWeight={600} mt={1} ml={2}>
              <RichText>{tags => t.rich('description', tags)}</RichText>
            </Typography>
          </Grid>
        )}
        {mission.clauses.map((clause, index) => {
          const value = missionData?.clauses[index].value ?? null;
          const setValue = (value: string | number | boolean | null) => {
            updateClause(index, value);
          };

          return (
            <MissionClause
              key={index}
              missionId={mission.id}
              missionIndex={missionIndex}
              clauseIndex={index}
              clause={clause}
              maxWidth={missionWidth * 0.9}
              value={value}
              setValue={setValue}
            />
          );
        })}
        <Grid size={12} mt={2}>
          {getRemarks().map((remark, index) => (
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
        {errors.length > 0 &&
          errors.map(error => (
            <Grid key={error.id} size={12} mt={2}>
              <Typography pl={3} fontSize="1rem" color="error" fontWeight={700}>
                {t(error.description)}
              </Typography>
            </Grid>
          ))}
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
