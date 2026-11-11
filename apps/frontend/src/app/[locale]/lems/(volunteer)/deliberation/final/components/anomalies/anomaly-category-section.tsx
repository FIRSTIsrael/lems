'use client';

import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { JudgingCategory } from '@lems/database';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { getRubricColors } from '@lems/shared/rubrics';
import { Anomaly } from '../../final-deliberation-computation';
import { useEdition } from '../../../../hooks/use-edition';
import { AnomalyDifferenceChip } from './anomaly-difference-chip';

interface AnomalyCategorySectionProps {
  category: JudgingCategory;
  anomalies: Anomaly[];
  teamNames: Record<string, string>;
}

export const AnomalyCategorySection: React.FC<AnomalyCategorySectionProps> = ({
  category,
  anomalies,
  teamNames
}) => {
  const t = useTranslations('pages.deliberations.final.anomalies');
  const edition = useEdition();
  const { getCategory } = useJudgingCategoryTranslations(edition);
  const { main: color, section: sectionColor } = getRubricColors(edition, category);

  return (
    <Box sx={{ borderRadius: 1, overflow: 'hidden', border: `1px solid ${color}40` }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          backgroundColor: sectionColor,
          borderInlineStart: `4px solid ${color}`
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color }}>
          {getCategory(category)}
        </Typography>
        <Chip
          size="small"
          label={anomalies.length}
          sx={{ backgroundColor: color, color: 'white' }}
        />
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('team')}</TableCell>
            <TableCell align="center">{t('picklist')}</TableCell>
            <TableCell align="center">{t('calculated')}</TableCell>
            <TableCell align="center">{t('difference')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {anomalies.map(anomaly => (
            <TableRow key={anomaly.teamId} sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell sx={{ maxWidth: 180 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  #{anomaly.teamNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {teamNames[anomaly.teamId]}
                </Typography>
              </TableCell>
              <TableCell align="center">{anomaly.picklistPosition}</TableCell>
              <TableCell align="center">{anomaly.calculatedRank}</TableCell>
              <TableCell align="center">
                <AnomalyDifferenceChip anomaly={anomaly} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
