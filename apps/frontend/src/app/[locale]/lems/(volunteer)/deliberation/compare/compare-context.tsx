'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { JudgingCategory } from '@lems/types/judging';
import { inferCoreValuesFields } from '@lems/shared/rubrics';
import type { Team, Rubric, RubricFieldValue, Award } from './graphql/types';

export interface FieldComparison {
  fieldId: string;
  values: Map<string, number>; // teamId -> score
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
  category?: JudgingCategory;
}

export const CompareProvider = ({ children, teams, awards, category }: CompareProviderProps) => {
  const value = useMemo(() => {
    // Collect all rubrics based on category filter
    const rubricsToCompare: Rubric[] = [];
    const categories: JudgingCategory[] = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

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

    // Infer Core Values fields from IP and RD rubrics if CV is being compared
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

    // Calculate field comparisons
    const fieldComparisons = new Map<string, FieldComparison>();
    const allFields = new Set<string>();

    // Collect all field IDs
    rubricsToCompare.forEach(rubric => {
      if (rubric.data?.fields) {
        Object.keys(rubric.data.fields).forEach(fieldId => allFields.add(fieldId));
      }
    });

    // Calculate min/max for each field
    allFields.forEach(fieldId => {
      const values = new Map<string, number>();
      let min = Infinity;
      let max = -Infinity;

      teams.forEach(team => {
        let fieldValue: number | null = null;

        // Try to find the field in the appropriate rubric
        categories.forEach(cat => {
          const rubric = team.rubrics[
            cat.replace('-', '_') as keyof typeof team.rubrics
          ] as Rubric | null;
          if (rubric?.data?.fields?.[fieldId]?.value) {
            fieldValue = rubric.data.fields[fieldId].value;
          }
        });

        if (fieldValue !== null) {
          values.set(team.id, fieldValue);
          min = Math.min(min, fieldValue);
          max = Math.max(max, fieldValue);
        }
      });

      if (values.size > 0) {
        fieldComparisons.set(fieldId, { fieldId, values, min, max });
      }
    });

    // Calculate W/T/L for each team
    const teamComparisons = new Map<string, TeamComparison>();
    teams.forEach(team => {
      let wins = 0;
      let ties = 0;
      let losses = 0;

      fieldComparisons.forEach(comparison => {
        const teamValue = comparison.values.get(team.id);
        if (teamValue === undefined) return;

        if (teamValue === comparison.max && comparison.max > comparison.min) {
          wins++;
        } else if (teamValue === comparison.min && comparison.max > comparison.min) {
          losses++;
        } else {
          ties++;
        }
      });

      teamComparisons.set(team.id, { teamId: team.id, wins, ties, losses });
    });

    return {
      teams,
      awards,
      category,
      fieldComparisons,
      teamComparisons,
      coreValuesFields
    };
  }, [teams, awards, category]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};
