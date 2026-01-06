import { createContext, useContext, useMemo } from 'react';
import { JudgingCategory } from '@lems/database';
import { Award } from '@lems/shared';
import {
  computeNormalizedScores,
  computeRoomMetrics,
  computeTeamScores,
  getGPScores,
  getOrganizedRubricFields
} from '../utils';
import { EligiblityPerStage, EnrichedTeam, FinalDeliberationContextValue } from './types';
import { Division } from './graphql';
import {
  computeChampionsEligibility,
  computeCoreAwardsEligibility,
  computeOptionalAwardsEligibility,
  computeRank,
  extractOptionalAwards
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
  const deliberation = division.judging.finalDeliberation;
  const awards = division.judging.awards;

  const awardCounts: Partial<Record<Award, number>> = awards.reduce(
    (acc, award) => {
      if (!award.isOptional) {
        acc[award.name as Award] = (acc[award.name as Award] || 0) + 1;
      }
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

  const value = useMemo<FinalDeliberationContextValue>(() => {
    // Step 1: Compute base team scores (category scores and GP)
    const teamScores = division.teams.map(team => computeTeamScores(team));

    const teamsWithScores = division.teams.map((team, index) => ({
      ...team,
      scores: teamScores[index]
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
      // Compute ranks
      const ranks = computeRank(teamsWithScores[index], teamsWithScores, categoryPicklists);

      const eligibilites: EligiblityPerStage = {
        champions: computeChampionsEligibility({ ...team, ranks }, awardCounts['champions'] || 0),
        'core-awards': computeCoreAwardsEligibility(
          team,
          categoryPicklists,
          deliberation.coreAwardsManualEligibility || []
        ),
        'optional-awards': computeOptionalAwardsEligibility(
          { ...team, awardNominations },
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
      };
    });
  }, [
    division.teams,
    categoryPicklists,
    awardCounts,
    deliberation.coreAwardsManualEligibility,
    deliberation.optionalAwardsManualEligibility
  ]);

  return (
    <FinalDeliberationContext.Provider value={value}>{children}</FinalDeliberationContext.Provider>
  );
};

export const useFinalDeliberationContext = (): FinalDeliberationContextValue => {
  const context = useContext(FinalDeliberationContext);
  if (!context) {
    throw new Error('useFinalDeliberationContext must be used within a FinalDeliberationProvider');
  }
  return context;
};
