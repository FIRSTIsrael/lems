'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Mission } from '@lems/types/scoring';
import { scoresheet } from '@lems/shared/scoresheet';
import { useScore, ErrorWithMessage } from '../hooks/use-score';

const ALLOW_DEFAULT_VALUES = false;

interface MissionContextType {
  points: number;
  missions: Mission[];
  missionErrors: ErrorWithMessage[];
  validatorErrors: ErrorWithMessage[];
  onUpdateClause: (
    missionIndex: number,
    clauseIndex: number,
    value: string | number | boolean | null
  ) => void;
  resetScore: () => void;
}

export const MissionContext = createContext<MissionContextType>({
  points: 0,
  missions: [] as Mission[],
  missionErrors: [] as ErrorWithMessage[],
  validatorErrors: [] as ErrorWithMessage[],
  onUpdateClause: () => console.log('No context'),
  resetScore: () => console.log('No context')
});

export function MissionProvider({ children }: { children: ReactNode }) {
  const { score, updateScore, resetScore, loading } = useScore();

  const getDefaultScoresheet = () => {
    const missions: Mission[] = scoresheet.missions.map(mission => {
      return {
        id: mission.id,
        clauses: mission.clauses.map(clause => {
          const value = ALLOW_DEFAULT_VALUES ? clause.default : null;
          return { type: clause.type, value };
        })
      };
    });

    return missions;
  };

  useEffect(() => {
    if (!loading && !score) {
      const defaultScore = getDefaultScoresheet();
      updateScore(defaultScore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, score]);

  const onUpdateClause = (
    missionIndex: number,
    clauseIndex: number,
    value: string | number | boolean | null
  ) => {
    if (!score) return;
    const newMissions = structuredClone(score.missions);
    newMissions[missionIndex].clauses[clauseIndex].value = value;
    updateScore(newMissions);
  };

  return (
    <MissionContext.Provider
      value={{
        points: score?.points || 0,
        missions: score?.missions || [],
        missionErrors: score?.missionErrors || [],
        validatorErrors: score?.validatorErrors || [],
        onUpdateClause,
        resetScore
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export const useMission = (index: number) => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }

  const mission = context.missions[index];
  const errors = context.missionErrors.filter(error => error.mission === mission.id);
  const updateClause = (clauseIndex: number, value: string | number | boolean | null) => {
    context.onUpdateClause(index, clauseIndex, value);
  };

  return { mission, errors, updateClause };
};

export const useScoresheetValidator = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMissionContext must be used within a MissionProvider');
  }

  return { errors: context.validatorErrors };
};
