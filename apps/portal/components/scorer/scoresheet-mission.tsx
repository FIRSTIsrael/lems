import { useLayoutEffect, useRef, useState } from 'react';
import { MissionSchema, localizedScoresheet } from '@lems/season';
import { Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import MissionClause from './mission-clause';
import NoEquipmentImage from '../../public/assets/scoresheet/no-equipment.svg';
import { useMission } from './mission-context';

interface ScoresheetMissionProps {
  missionIndex: number;
  mission: MissionSchema;
  src: string;
  errors?: { id: string; description: string }[];
}

const ScoresheetMission: React.FC<ScoresheetMissionProps> = ({
  missionIndex,
  mission,
  src,
  errors = []
}) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const { mission: missionData, updateClause } = useMission(missionIndex);
  const [missionWidth, setMissionWidth] = useState(0);

  useLayoutEffect(() => {
    setMissionWidth(ref.current?.offsetWidth || 0);
  }, []);

  const localizedMission = localizedScoresheet.missions.find(m => m.id === mission.id);

  return (
    localizedMission && (
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
                {localizedMission.title}
              </Typography>
              {mission.noEquipment && (
                <Image src={NoEquipmentImage} width={35} height={35} alt="איסור ציוד" />
              )}
            </Stack>
          </Grid>
          {localizedMission.description && (
            <Grid size={12}>
              <Typography fontSize="1rem" fontWeight={600} mt={1} ml={2}>
                {localizedMission.description}
              </Typography>
            </Grid>
          )}
          {mission.clauses.map((clause, index) => {
            const value = missionData?.clauses[index].value;
            const setValue = (value: string | number | boolean | null) => {
              updateClause(index, value);
            };

            return (
              <MissionClause
                key={index}
                missionIndex={missionIndex}
                clauseIndex={index}
                clause={clause}
                localizedMission={localizedMission}
                maxWidth={missionWidth * 0.9}
                value={value}
                setValue={setValue}
              />
            );
          })}
          <Grid size={12} mt={2}>
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
              <Grid key={e?.id} size={12} mt={2}>
                <Typography pl={3} fontSize="1rem" color="error" fontWeight={700}>
                  {e?.description}
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
            alt={`תמונה של משימה ${mission.id}`}
            style={{
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
