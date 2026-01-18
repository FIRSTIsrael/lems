import { useMemo } from 'react';
import type { Scoresheet, MatchStage } from '../graphql';

export interface ScoreboardRound {
  stage: string;
  round: number;
}

export const useScoreboardRounds = (
  scoresheets: Scoresheet[],
  currentStage: MatchStage
): ScoreboardRound[] => {
  return useMemo(() => {
    const roundsSet = new Set<string>();
    scoresheets
      .filter(s => s.stage === currentStage)
      .forEach(s => {
        roundsSet.add(`${s.stage}-${s.round}`);
      });
    return Array.from(roundsSet)
      .map(key => {
        const [stage, roundStr] = key.split('-');
        return { stage, round: parseInt(roundStr, 10) };
      })
      .filter(value => value.stage === currentStage)
      .sort((a, b) => (a.stage === b.stage ? a.round - b.round : 0));
  }, [scoresheets, currentStage]);
};
