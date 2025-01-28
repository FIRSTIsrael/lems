import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Mission } from '@lems/types';
import { SEASON_SCORESHEET, ALLOW_SCORESHEET_DEFAULTS } from '@lems/season';
import { useScore } from '../../hooks/use-score';

interface MissionContextType {
  missions: Mission[];
  onUpdateClause: (
    missionIndex: number,
    clauseIndex: number,
    value: string | number | boolean | null
  ) => void;
}

const MissionContext = createContext<MissionContextType | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const { score, updateScore, loading } = useScore();

  const getDefaultScoresheet = () => {
    const missions: Mission[] = SEASON_SCORESHEET.missions.map(mission => {
      return {
        id: mission.id,
        clauses: mission.clauses.map((c, index) => {
          const value = ALLOW_SCORESHEET_DEFAULTS ? c.default : null;
          return { type: c.type, value };
        })
      };
    });

    return { missions, points: 0 };
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
    const newScore = { ...score };
    newScore.missions[missionIndex].clauses[clauseIndex].value = value;
    updateScore(newScore);
  };

  return (
    <MissionContext.Provider
      value={{
        missions: score?.missions || [],
        onUpdateClause
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
  const updateClause = (clauseIndex: number, value: string | number | boolean | null) => {
    context.onUpdateClause(index, clauseIndex, value);
  };
  return { mission, updateClause };
};
