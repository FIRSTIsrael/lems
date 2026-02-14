import { createContext, useCallback, useContext, useMemo } from 'react';
import { JudgingCategory } from '@lems/database';
import { Award } from '@lems/shared';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  computeNormalizedScores,
  computeRoomMetrics,
  computeTeamScores,
  getGPScores,
  getOrganizedRubricFields
} from '../utils';
import {
  DeliberationAwards,
  EligiblityPerStage,
  EnrichedTeam,
  FinalDeliberationContextValue,
  StagesWithNomination
} from './types';
import {
  ADVANCE_FINAL_DELIBERATION_STAGE_MUTATION,
  Division,
  START_FINAL_DELIBERATION_MUTATION,
  UPDATE_FINAL_DELIBERATION_AWARDS_MUTATION,
  UPDATE_MANUAL_ELIGIBILITY_MUTATION
} from './graphql';
import {
  computeCoreAwardsEligibility,
  computeOptionalAwardsEligibility,
  computeRank,
  computeRawRank,
  extractOptionalAwards,
  computeAnomalies
} from './final-deliberation-computation';

const FinalDeliberationContext = createContext<FinalDeliberationContextValue | null>(null);

interface FinalDeliberationProviderProps {
  divisionId: string;
  division: Division;
  children?: React.ReactNode;
}

export const FinalDeliberationProvider = ({
  divisionId,
  division,
  children
}: FinalDeliberationProviderProps) => {
  const t = useTranslations('pages.deliberations.final.errors');
  const deliberation = division.judging.finalDeliberation;
  const deliberationAwards = division.judging.awards.filter(award => award.type === 'TEAM');

  // Mutations
  const [startFinalDeliberation] = useMutation(START_FINAL_DELIBERATION_MUTATION);
  const [advanceStage] = useMutation(ADVANCE_FINAL_DELIBERATION_STAGE_MUTATION);
  const [updateFinalDeliberationAwards] = useMutation(UPDATE_FINAL_DELIBERATION_AWARDS_MUTATION);
  const [updateManualEligibility] = useMutation(UPDATE_MANUAL_ELIGIBILITY_MUTATION);

  const awardCounts: Partial<Record<Award, number>> = deliberationAwards.reduce(
    (acc, award) => {
      acc[award.name as Award] = (acc[award.name as Award] || 0) + 1;
      return acc;
    },
    {} as Partial<Record<Award, number>>
  );

  const categoryPicklists = useMemo<Record<JudgingCategory, string[]>>(
    () => ({
      'robot-design': division.judging.robotDesignDeliberation.picklist || [],
      'innovation-project': division.judging.innovationProjectDeliberation.picklist || [],
      'core-values': division.judging.coreValuesDeliberation.picklist || []
    }),
    [
      division.judging.robotDesignDeliberation.picklist,
      division.judging.innovationProjectDeliberation.picklist,
      division.judging.coreValuesDeliberation.picklist
    ]
  );

  const optionalAwards = useMemo<Partial<DeliberationAwards>>(
    () =>
      Object.entries(deliberation.optionalAwards).reduce<Partial<Record<Award, string[]>>>(
        (acc, [awardName, teamIds]) => {
          acc[awardName as Award] = teamIds as string[];
          return acc;
        },
        {}
      ),
    [deliberation.optionalAwards]
  );

  const awards = useMemo<DeliberationAwards>(
    () => ({
      champions: deliberation.champions ?? ({} as Record<number, string>),
      'core-values': deliberation.coreValues || [],
      'innovation-project': deliberation.innovationProject || [],
      'robot-design': deliberation.robotDesign || [],
      'robot-performance': deliberation.robotPerformance || [],
      ...optionalAwards
    }),
    [deliberation, optionalAwards]
  );

  // Helper functions for mutations - use useCallback to ensure stable references
  const handleStartFinalDeliberation = useCallback(async () => {
    await startFinalDeliberation({
      variables: { divisionId }
    });
  }, [startFinalDeliberation, divisionId]);

  const handleAdvanceStage = useCallback(async () => {
    await advanceStage({
      variables: { divisionId }
    });
  }, [advanceStage, divisionId]);

  const handleUpdateFinalDeliberationAwards = useCallback(
    async (awardName: Award, updatedAward: string[] | Record<number, string>) => {
      if ((updatedAward as string[]).length > (awardCounts[awardName as Award] || 0)) {
        toast.error(t('award-limit-exceeded'));
        return;
      }
      await updateFinalDeliberationAwards({
        variables: { divisionId, awards: JSON.stringify({ [awardName]: updatedAward }) }
      });
    },
    [updateFinalDeliberationAwards, divisionId, awardCounts, t]
  );

  const handleUpdateManualEligibility = useCallback(
    async (stage: StagesWithNomination, teamIds: string[]) => {
      await updateManualEligibility({
        variables: { divisionId, stage, teamIds }
      });
    },
    [updateManualEligibility, divisionId]
  );

  const value = useMemo<FinalDeliberationContextValue>(() => {
    // Step 1: Compute base team scores (category scores and GP)
    const teamScores = division.teams.map(team => computeTeamScores(team));

    const teamsWithScores = division.teams.map((team, index) => ({
      ...team,
      scores: teamScores[index],
      robotGameScores: team.scoresheets.map(s => s.data?.score || 0)
    }));

    // Step 2: Compute room metrics (aggregated scores per room)
    const roomMetrics = computeRoomMetrics(
      teamScores,
      division.teams.filter(t => t.arrived)
    );

    // Step 3: Compute enriched teams with ranks and eligibility
    const enrichedTeams: EnrichedTeam[] = division.teams.map((team, index) => {
      const scores = teamScores[index];
      const normalizedScores = computeNormalizedScores(
        scores,
        roomMetrics,
        team.judgingSession?.room.id
      );
      const awardNominations = extractOptionalAwards(team.rubrics);
      // Compute ranks (with picklist consideration)
      const ranks = computeRank(teamsWithScores[index], teamsWithScores, categoryPicklists);
      // Compute raw ranks (score-based only, for anomaly detection)
      const rawRanks = computeRawRank(teamsWithScores[index], teamsWithScores);

      const eligibilites: Partial<EligiblityPerStage> = {
        'core-awards': computeCoreAwardsEligibility(
          team,
          categoryPicklists,
          awards,
          deliberation.coreAwardsManualEligibility || []
        ),
        'optional-awards': computeOptionalAwardsEligibility(
          { ...team, awardNominations },
          awards,
          deliberation.optionalAwardsManualEligibility || []
        )
      };

      const robotGameScores = team.scoresheets.reduce<Record<string, number | null>>(
        (acc, sheet) => {
          acc[sheet.round] = sheet.data?.score || null;
          return acc;
        },
        {}
      );
      const gpScores = getGPScores(team);

      return {
        id: team.id,
        number: team.number,
        name: team.name,
        arrived: team.arrived,
        disqualified: team.disqualified,
        slug: team.slug,
        room: team.judgingSession?.room ?? null,
        scores,
        normalizedScores,
        ranks,
        rawRanks,
        eligibility: eligibilites,
        robotGameScores,
        rubricsFields: {
          'robot-design': getOrganizedRubricFields(team, 'robot-design'),
          'innovation-project': getOrganizedRubricFields(team, 'innovation-project'),
          'core-values': getOrganizedRubricFields(team, 'core-values')
        },
        rubricIds: {
          'robot-design': team.rubrics.robot_design?.id || null,
          'innovation-project': team.rubrics.innovation_project?.id || null,
          'core-values': team.rubrics.core_values?.id || null
        },
        gpScores,
        awardNominations
      } as EnrichedTeam;
    });

    const teamsSortedByTotalRank = [...enrichedTeams]
      .sort((a, b) => a.ranks.total - b.ranks.total)
      .filter(team => team.arrived && !team.disqualified);

    const championsCount = division.judging.advancementPercentage
      ? Math.round((division.teams.length * division.judging.advancementPercentage) / 100)
      : (awardCounts.champions || 0) + 3;

    const eligibleTeams: Record<StagesWithNomination, string[]> = {
      champions: teamsSortedByTotalRank.slice(0, championsCount).map(t => t.id),
      'core-awards': enrichedTeams.filter(t => t.eligibility['core-awards']).map(t => t.id),
      'optional-awards': enrichedTeams.filter(t => t.eligibility['optional-awards']).map(t => t.id)
    };
    const availableTeams = enrichedTeams
      .filter(t => (eligibleTeams[deliberation.stage as StagesWithNomination] ?? []).includes(t.id))
      .map(t => t.id);

    // Compute anomalies based on picklist positions vs calculated ranks
    const anomalies = computeAnomalies(enrichedTeams, categoryPicklists);

    return {
      division,
      deliberation,
      teams: enrichedTeams,
      eligibleTeams,
      availableTeams,
      categoryPicklists,
      awards,
      awardCounts,
      deliberationAwards,
      roomMetrics,
      anomalies,
      startDeliberation: handleStartFinalDeliberation,
      updateAward: handleUpdateFinalDeliberationAwards,
      advanceStage: handleAdvanceStage,
      updateManualEligibility: handleUpdateManualEligibility
    };
  }, [
    division,
    deliberation,
    categoryPicklists,
    awards,
    awardCounts,
    deliberationAwards,
    handleStartFinalDeliberation,
    handleUpdateFinalDeliberationAwards,
    handleAdvanceStage,
    handleUpdateManualEligibility
  ]);

  return (
    <FinalDeliberationContext.Provider value={value}>{children}</FinalDeliberationContext.Provider>
  );
};

export const useFinalDeliberation = (): FinalDeliberationContextValue => {
  const context = useContext(FinalDeliberationContext);
  if (!context) {
    throw new Error('useFinalDeliberation must be used within a FinalDeliberationProvider');
  }
  return context;
};
