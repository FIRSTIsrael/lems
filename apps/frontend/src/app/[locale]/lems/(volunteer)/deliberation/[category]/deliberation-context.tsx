'use client';

import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { JudgingCategory } from '@lems/types/judging';
import { underscoresToHyphens } from '@lems/shared/utils';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  computeTeamScores,
  computeRoomMetrics,
  getFieldDisplayLabels,
  computeNormalizedScores,
  getOrganizedRubricFields,
  getGPScores
} from '../utils';
import type { DeliberationContextValue, EnrichedTeam } from './types';
import type { Division } from './graphql/types';
import {
  computeRank,
  computeEligibility,
  PICKLIST_LIMIT_MULTIPLIER,
  MAX_PICKLIST_LIMIT
} from './deliberation-computation';
import { START_DELIBERATION_MUTATION, UPDATE_DELIBERATION_PICKLIST_MUTATION } from './graphql';

const DeliberationContext = createContext<DeliberationContextValue | null>(null);

interface DeliberationProviderProps {
  divisionId: string;
  category: JudgingCategory;
  division: Division;
  children?: ReactNode;
}

export function CategoryDeliberationProvider({
  divisionId,
  category,
  division,
  children
}: DeliberationProviderProps) {
  const deliberation = division.judging.deliberation;
  const t = useTranslations('pages.deliberations.category.picklist');
  const hypenatedCategory = underscoresToHyphens(category) as JudgingCategory;

  const picklistLimit = Math.min(
    MAX_PICKLIST_LIMIT,
    Math.ceil(division.teams.length * PICKLIST_LIMIT_MULTIPLIER)
  );

  // Mutations
  const [startDeliberation] = useMutation(START_DELIBERATION_MUTATION);
  const [updateDeliberationPicklist] = useMutation(UPDATE_DELIBERATION_PICKLIST_MUTATION);

  // Helper functions for mutations - use useCallback to ensure stable references
  const handleStartDeliberation = useCallback(async () => {
    await startDeliberation({
      variables: { divisionId, category }
    });
  }, [startDeliberation, divisionId, category]);

  const handleUpdatePicklist = useCallback(
    async (teamIds: string[]) => {
      await updateDeliberationPicklist({
        variables: { divisionId, category, picklist: teamIds }
      });
    },
    [updateDeliberationPicklist, divisionId, category]
  );

  const handleAddToPicklist = useCallback(
    async (teamId: string) => {
      if ((deliberation?.picklist?.length ?? 0) >= picklistLimit) {
        toast.error(t('error-limit-exceeded'));
        return;
      }
      const currentPicklist = deliberation?.picklist ?? [];
      const newPicklist = [...currentPicklist, teamId];
      await handleUpdatePicklist(newPicklist);
    },
    [deliberation, handleUpdatePicklist, t, picklistLimit]
  );

  const handleRemoveFromPicklist = useCallback(
    async (teamId: string) => {
      const currentPicklist = deliberation?.picklist ?? [];
      const newPicklist = currentPicklist.filter((id: string) => id !== teamId);
      await handleUpdatePicklist(newPicklist);
    },
    [deliberation, handleUpdatePicklist]
  );

  const handleReorderPicklist = useCallback(
    async (sourceIndex: number, destIndex: number) => {
      const currentPicklist = deliberation?.picklist ?? [];
      const newPicklist = [...currentPicklist];
      const [removed] = newPicklist.splice(sourceIndex, 1);
      newPicklist.splice(destIndex, 0, removed);
      await handleUpdatePicklist(newPicklist);
    },
    [deliberation, handleUpdatePicklist]
  );

  const value = useMemo<DeliberationContextValue>(() => {
    // Step 1: Compute base team scores (category scores and GP)
    const teamScores = division.teams.map(team => computeTeamScores(team));

    // Step 2: Compute room metrics (aggregated scores per room)
    const roomMetrics = computeRoomMetrics(
      teamScores,
      division.teams.filter(t => t.arrived)
    );

    // Step 2a: Get field display labels for this category
    const fieldDisplayLabels = getFieldDisplayLabels(category);

    // Step 3: Compute normalized scores and ranks
    const enrichedTeams = division.teams
      .map((team, index) => {
        const scores = teamScores[index];
        const normalizedScores = computeNormalizedScores(
          scores,
          roomMetrics,
          team.judgingSession?.room.id
        );
        const rank = computeRank(scores, teamScores, category);
        const isEligible = computeEligibility(team, deliberation);
        const rubricFields = getOrganizedRubricFields(team, category);
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
          rank,
          eligible: isEligible,
          rubricFields,
          gpScores,
          rubricId: team.rubrics[hypenatedCategory as keyof typeof team.rubrics]?.id ?? null,
          awardNominations: team.rubrics.core_values?.data?.awards ?? {}
        } as EnrichedTeam;
      })
      .filter(t => !t.disqualified && t.arrived);

    // Step 3a: Compute picklist and availability
    const picklistTeamIds = deliberation?.picklist ?? [];
    const picklistTeams = picklistTeamIds
      .map(id => enrichedTeams.find(t => t.id === id))
      .filter((t): t is EnrichedTeam => t !== undefined);
    const eligibleTeams = enrichedTeams.filter(t => t.eligible).map(t => t.id);
    const availableTeams = eligibleTeams.filter(id => !picklistTeamIds.includes(id));

    // Step 3b: Find suggested team (top-scoring available team)
    let suggestedTeam: EnrichedTeam | null = null;
    if (availableTeams.length > 0) {
      const availableEnriched = availableTeams
        .map(id => enrichedTeams.find(t => t.id === id))
        .filter((t): t is EnrichedTeam => t !== undefined);

      // Sort by score descending, tiebreak by normalized score
      availableEnriched.sort((a, b) => {
        const scoreDiff = b.scores[hypenatedCategory] - a.scores[hypenatedCategory];
        if (scoreDiff !== 0) return scoreDiff;
        return b.normalizedScores[hypenatedCategory] - a.normalizedScores[hypenatedCategory];
      });

      // Check if there's a clear top team (no tie)
      if (availableEnriched.length > 1) {
        const topTeam = availableEnriched[0];
        const secondTeam = availableEnriched[1];
        const isTie =
          topTeam.scores[hypenatedCategory] === secondTeam.scores[hypenatedCategory] &&
          topTeam.normalizedScores[hypenatedCategory] ===
            secondTeam.normalizedScores[hypenatedCategory];
        if (!isTie) {
          suggestedTeam = topTeam;
        }
      } else if (availableEnriched.length === 1) {
        suggestedTeam = availableEnriched[0];
      }
    }

    return {
      division,
      deliberation: deliberation ?? null,
      teams: enrichedTeams,
      eligibleTeams,
      availableTeams,
      picklistTeams,
      suggestedTeam,
      picklistLimit,
      fieldDisplayLabels,
      roomMetrics,
      startDeliberation: handleStartDeliberation,
      updatePicklist: handleUpdatePicklist,
      addToPicklist: handleAddToPicklist,
      removeFromPicklist: handleRemoveFromPicklist,
      reorderPicklist: handleReorderPicklist
    };
  }, [
    division,
    deliberation,
    category,
    picklistLimit,
    hypenatedCategory,
    handleStartDeliberation,
    handleUpdatePicklist,
    handleAddToPicklist,
    handleRemoveFromPicklist,
    handleReorderPicklist
  ]);

  return <DeliberationContext.Provider value={value}>{children}</DeliberationContext.Provider>;
}

export function useCategoryDeliberation(): DeliberationContextValue {
  const context = useContext(DeliberationContext);
  if (!context) {
    throw new Error('useCategoryDeliberation must be used within a CategoryDeliberationProvider');
  }
  return context;
}
