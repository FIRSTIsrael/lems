'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Paper, Stack, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useScoresheetMissionTranslations } from '@lems/localization';
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
  const theme = useTheme();
  const { mission: missionData, errors, updateClause } = useMission(missionIndex);
  const { title, description, remarks, getError } = useScoresheetMissionTranslations(mission.id);
  const [missionWidth, setMissionWidth] = useState(0);

  // Use callback ref to measure width when element mounts
  const measureRef = (node: HTMLDivElement | null) => {
    if (node) {
      setMissionWidth(node.offsetWidth);
    }
  };

  return (
    <Grid
      component={Paper}
      container
      id={mission.id}
      sx={{
        pb: 2
      }}
    >
      <Grid container size={{ xs: 12, md: 8 }} ref={measureRef}>
        <Grid
          size={2}
          sx={{
            py: 1,
            alignSelf: 'flex-start',
            bgcolor: errors.length > 0 ? theme.palette.error.main : theme.palette.primary.main,
            borderRadius: '6px 0 0 0',
            textAlign: 'center'
          }}
        >
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#FFF'
            }}
          >
            {mission.id.toUpperCase()}
          </Typography>
        </Grid>
        <Grid
          size={10}
          sx={{
            pt: 1
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center'
            }}
          >
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 600,
                pl: 4
              }}
            >
              {title}
            </Typography>
            {mission.noEquipment && (
              <Image src={NoEquipmentImage} width={35} height={35} alt="No equipment constraint" />
            )}
          </Stack>
        </Grid>
        {description && (
          <Grid size={12}>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                mt: 1,
                ml: 2
              }}
            >
              {description}
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
        <Grid
          size={12}
          sx={{
            mt: 2
          }}
        >
          {remarks.map((remark, index) => (
            <Typography
              key={`${mission.id}-remark-${index}`}
              color="primary"
              sx={{
                pl: 3,
                fontSize: '1rem',
                fontStyle: 'italic'
              }}
            >
              {remark}
            </Typography>
          ))}
        </Grid>
        {errors.length > 0 &&
          errors.map(error => (
            <Grid
              key={error.id}
              size={12}
              sx={{
                mt: 2
              }}
            >
              <Typography
                color="error"
                sx={{
                  pl: 3,
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              >
                {getError(error.id)}
              </Typography>
            </Grid>
          ))}
      </Grid>
      <Grid
        size={{ xs: 0, md: 4 }}
        sx={{
          borderRadius: 8,
          p: 2,
          display: { xs: 'none', md: 'block' }
        }}
      >
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
