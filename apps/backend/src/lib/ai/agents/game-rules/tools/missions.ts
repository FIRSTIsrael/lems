import { tool } from 'langchain';
import { z } from 'zod';
import { getMission, listMissions } from '../corpus';

export const getMissions = tool(async () => listMissions(), {
  name: 'get_missions',
  description: 'List all mission ids and names. Use to find a mission id before read_mission.',
  schema: z.object({})
});

export const readMission = tool(
  async ({ missionId }) => {
    const mission = getMission(missionId);
    if (!mission) throw new Error(`Unknown mission id: ${missionId}`);
    return mission;
  },
  {
    name: 'read_mission',
    description:
      'Read the full verbatim text of one mission: description, scoring text, clauses, errors, remarks, and RGR page. Requires a mission id from get_missions or semantic_search.',
    schema: z.object({ missionId: z.string().min(1) })
  }
);
