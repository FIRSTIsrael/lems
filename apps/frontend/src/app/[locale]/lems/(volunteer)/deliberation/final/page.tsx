'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Stack, Typography, Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { transformTeams } from './lib/transform';
import { getEligibleTeams } from './lib/eligibility';
import type { FinalDeliberationStage } from './lib/types';
import { STAGE_ORDER } from './lib/constants';
import { ChampionsDeliberation } from './components/champions-deliberation';
import { CoreAwardsDeliberation } from './components/core-awards-deliberation';
import { OptionalAwardsDeliberation } from './components/optional-awards-deliberation';
import { ReviewDeliberation } from './components/review-deliberation';
import {
  createTeamArrivalUpdatedSubscription,
  createRubricUpdatedSubscription,
  createScoresheetUpdatedSubscription,
  GET_FINAL_DELIBERATION,
  parseFinalDeliberationData
} from './graphql';

export default function FinalDeliberationPage(): React.ReactElement {
  const t = useTranslations('deliberations.final');
  const router = useRouter();
  const { currentDivision } = useEvent();

  const [currentStage, setCurrentStage] = useState<FinalDeliberationStage>('champions');
  const [selectedAwards, setSelectedAwards] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptions = useMemo(
    () => [
      createTeamArrivalUpdatedSubscription(currentDivision.id),
      createRubricUpdatedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data: division, loading } = usePageData(
    GET_FINAL_DELIBERATION,
    {
      divisionId: currentDivision.id
    },
    parseFinalDeliberationData,
    subscriptions
  );

  // All hooks must be called unconditionally
  const handleSelectTeamForAward = useCallback(
    (awardName: string, teamId: string, selected: boolean) => {
      setSelectedAwards(prev => ({
        ...prev,
        [awardName]: selected
          ? [...(prev[awardName] || []), teamId]
          : (prev[awardName] || []).filter(id => id !== teamId)
      }));
    },
    []
  );

  const handleAdvanceStage = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // TODO: Submit current stage results and advance
      const currentStageIndex = STAGE_ORDER.indexOf(currentStage);
      if (currentStageIndex < STAGE_ORDER.length - 1) {
        setCurrentStage(STAGE_ORDER[currentStageIndex + 1]);
      }
    } catch (error) {
      console.error('Failed to advance stage:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStage]);

  const handleCompleteDeliberation = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // TODO: Submit final deliberation
      router.push('/lems/judge-advisor');
    } catch (error) {
      console.error('Failed to complete deliberation:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  // Compute derived state
  const allTeams = useMemo(
    () => (division?.teams ? transformTeams(division.teams) : []),
    [division?.teams]
  );

  const eligibleTeams = useMemo(() => {
    if (!allTeams.length) return [];
    const disqualifiedTeamIds = division?.teams?.filter(t => t.disqualified).map(t => t.id) || [];

    return getEligibleTeams(
      allTeams,
      currentStage,
      disqualifiedTeamIds,
      [],
      0.3, // ADVANCEMENT_PERCENTAGE
      Object.keys(selectedAwards || {})
    );
  }, [allTeams, currentStage, selectedAwards, division?.teams]);

  // Now handle conditional rendering after all hooks are defined
  if (loading || !division) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t(`stages.${currentStage}`)}
          </Typography>
        </Stack>
      </Paper>

      {/* Stage Content */}
      <Box sx={{ mb: 3 }}>
        {currentStage === 'champions' && (
          <ChampionsDeliberation
            teams={eligibleTeams}
            allTeams={allTeams}
            selectedAwards={selectedAwards['champions'] || []}
            onSelectTeam={(teamId: string, selected: boolean) =>
              handleSelectTeamForAward('champions', teamId, selected)
            }
            disabled={isSubmitting}
          />
        )}
        {currentStage === 'core-awards' && (
          <CoreAwardsDeliberation
            teams={eligibleTeams}
            selectedAwards={selectedAwards}
            onSelectTeam={handleSelectTeamForAward}
            disabled={isSubmitting}
          />
        )}
        {currentStage === 'optional-awards' && (
          <OptionalAwardsDeliberation
            teams={eligibleTeams}
            selectedAwards={selectedAwards}
            onSelectTeam={handleSelectTeamForAward}
            disabled={isSubmitting}
          />
        )}
        {currentStage === 'review' && (
          <ReviewDeliberation teams={allTeams} selectedAwards={selectedAwards} />
        )}
      </Box>

      {/* Navigation */}
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={STAGE_ORDER.indexOf(currentStage) === 0 || isSubmitting}
          onClick={() => {
            const currentIndex = STAGE_ORDER.indexOf(currentStage);
            if (currentIndex > 0) {
              setCurrentStage(STAGE_ORDER[currentIndex - 1]);
            }
          }}
        >
          {t('buttons.previous')}
        </Button>

        {currentStage === 'review' ? (
          <Button variant="contained" disabled={isSubmitting} onClick={handleCompleteDeliberation}>
            {t('buttons.finalize')}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={isSubmitting || eligibleTeams.length === 0}
            onClick={handleAdvanceStage}
          >
            {t('buttons.next')}
          </Button>
        )}
      </Paper>
    </Box>
  );
}
