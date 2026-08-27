import { tool } from 'langchain';
import { z } from 'zod';
import { scoresheet, ScoresheetError, type ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { getMissionErrorDescriptions } from '../corpus';

const clauseValueSchema = z.union([
  z.boolean(),
  z.string(),
  z.number(),
  z.array(z.string()),
  z.null()
]);

function toErrorResult(error: unknown, errorDescriptions: Record<string, string>) {
  if (error instanceof ScoresheetError) {
    return { ok: false as const, errorId: error.id, description: errorDescriptions[error.id] };
  }
  throw error;
}

export const evaluateScore = tool(
  async ({ missions }) => {
    const values = missions as Record<string, ScoresheetClauseValue[]>;
    const errorDescriptions = getMissionErrorDescriptions();
    const breakdown: Record<string, number> = {};

    for (const [missionId, clauses] of Object.entries(values)) {
      const mission = scoresheet.missions.find(m => m.id === missionId);
      if (!mission) throw new Error(`Unknown mission id: ${missionId}`);
      try {
        breakdown[missionId] = mission.calculation(...clauses);
      } catch (error) {
        return toErrorResult(error, errorDescriptions);
      }
    }

    // Cross-mission validators need every mission's clauses, so they only run
    // once the full sheet is provided - never fail on missions not yet scored.
    if (scoresheet.missions.every(mission => mission.id in values)) {
      try {
        for (const validate of scoresheet.validators) validate(values);
      } catch (error) {
        return toErrorResult(error, errorDescriptions);
      }
    }

    const total = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
    return { ok: true as const, total, breakdown };
  },
  {
    name: 'evaluate_score',
    description:
      'Compute mission points using the official scoresheet logic - never calculate scores yourself. Pass only clause values the user or verified image analysis actually established, in clause order, keyed by mission id. Returns { ok: true, total, breakdown } or { ok: false, errorId, description } when the clause combination is illegal.',
    schema: z.object({
      missions: z.record(z.string(), z.array(clauseValueSchema))
    })
  }
);
