import { tool } from 'langchain';
import { z } from 'zod';
import { getUpdate, listUpdates } from '../corpus';

export const getUpdates = tool(async () => listUpdates(), {
  name: 'get_updates',
  description:
    'List all season update ids, names, and dates. Use to find an update id before read_update.',
  schema: z.object({})
});

export const readUpdate = tool(
  async ({ updateId }) => {
    const update = getUpdate(updateId);
    if (!update) throw new Error(`Unknown update id: ${updateId}`);
    return update;
  },
  {
    name: 'read_update',
    description:
      'Read the full verbatim text of one season update, including which rules/missions it applies to. An update overrides base rulebook text for events after its date.',
    schema: z.object({ updateId: z.string().min(1) })
  }
);
