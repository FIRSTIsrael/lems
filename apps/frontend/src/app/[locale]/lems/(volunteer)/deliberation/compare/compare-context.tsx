'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { JudgingCategory } from '@lems/types/judging';
import { inferCoreValuesFields } from '@lems/shared/rubrics';
import type { Team, Rubric, RubricFieldValue, Award, DivisionTeam } from './graphql/types';
import { getFieldComparisonColor } from './components/rubric-scores-utils';

export interface FieldComparison {
  values: Map<string, number>;
  min: number;
  max: number;
}

export interface TeamComparison {
  teamId: string;
  wins: number;
  ties: number;
  losses: number;
}

export interface CompareContextType {
  teams: Team[];
  awards: Award[];
  allTeams: DivisionTeam[];
  category?: JudgingCategory;
  fieldComparisons: Map<string, FieldComparison>;
  teamComparisons: Map<string, TeamComparison>;
  coreValuesFields: Map<string, RubricFieldValue>;
}

const CompareContext = createContext<CompareContextType | null>(null);

export const useCompareContext = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompareContext must be used within CompareProvider');
  }
  return context;
};

interface CompareProviderProps {
  children: ReactNode;
  teams: Team[];
  awards: Award[];
  allTeams: DivisionTeam[];
  category?: JudgingCategory;
}

export const CompareProvider = ({
  children,
  teams,
  awards,
  allTeams,
  category
}: CompareProviderProps) => {
  const value = useMemo(() => {
    const rubricsToCompare: Rubric[] = [];
    const categories: JudgingCategory[] = category
      ? [category]
      : ['innovation-project', 'robot-design'];

    teams.forEach(team => {
      categories.forEach(cat => {
        const rubric = team.rubrics[
          cat.replace('-', '_') as keyof typeof team.rubrics
        ] as Rubric | null;
        if (rubric?.data?.fields) {
          rubricsToCompare.push(rubric);
        }
      });
    });

    const coreValuesFields = new Map<string, RubricFieldValue>();
    if (!category || category === 'core-values') {
      teams.forEach(team => {
        const ipRubric = team.rubrics.innovation_project;
        const rdRubric = team.rubrics.robot_design;
        if (ipRubric?.data && rdRubric?.data) {
          const cvFields = inferCoreValuesFields(ipRubric.data, rdRubric.data);
          Object.entries(cvFields).forEach(([key, value]) => {
            coreValuesFields.set(`${team.id}-${key}`, value as RubricFieldValue);
          });
        }
      });
    }

    const fieldComparisons = new Map<string, FieldComparison>();
    const allFields = new Set<string>();

    rubricsToCompare.forEach(rubric => {
      if (rubric.data?.fields) {
        Object.keys(rubric.data.fields).forEach(fieldId => allFields.add(fieldId));
      }
    });

    allFields.forEach(fieldId => {
      const values = new Map<string, number>();
      let min = Infinity;
      let max = -Infinity;

      teams.forEach(team => {
        for (const cat of categories) {
          const rubric = team.rubrics[
            cat.replace('-', '_') as keyof typeof team.rubrics
          ] as Rubric | null;
          const fieldValue = rubric?.data?.fields?.[fieldId]?.value;

          if (fieldValue !== null && fieldValue !== undefined) {
            values.set(team.id, fieldValue);
            min = Math.min(min, fieldValue);
            max = Math.max(max, fieldValue);
            break;
          }
        }
      });

      if (values.size > 0) {
        fieldComparisons.set(fieldId, { values, min, max });
      }
    });

    const teamComparisons = new Map<string, TeamComparison>();
    teams.forEach(team => {
      let wins = 0;
      let ties = 0;
      let losses = 0;

      categories.forEach(cat => {
        const rubric = team.rubrics[
          cat.replace('-', '_') as keyof typeof team.rubrics
        ] as Rubric | null;

        if (rubric?.data?.fields) {
          Object.keys(rubric.data.fields).forEach(fieldId => {
            if (fieldComparisons.has(fieldId)) {
              const color = getFieldComparisonColor(fieldId, team.id, fieldComparisons);
              if (color === 'success') {
                wins++;
              } else if (color === 'error') {
                losses++;
              } else {
                ties++;
              }
            }
          });
        }
      });

      teamComparisons.set(team.id, { teamId: team.id, wins, ties, losses });
    });

    return {
      teams,
      awards,
      allTeams,
      category,
      fieldComparisons,
      teamComparisons,
      coreValuesFields
    };
  }, [teams, awards, allTeams, category]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};
