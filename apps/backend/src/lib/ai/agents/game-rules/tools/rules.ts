import { tool } from 'langchain';
import { z } from 'zod';
import { getRule, listRules } from '../corpus';

export const getRules = tool(async () => listRules(), {
  name: 'get_rules',
  description:
    'List all rule ids, rule numbers, and section ids. Use to find a rule id before read_rule.',
  schema: z.object({})
});

export const readRule = tool(
  async ({ ruleId }) => {
    const rule = getRule(ruleId);
    if (!rule) throw new Error(`Unknown rule id: ${ruleId}`);
    return rule;
  },
  {
    name: 'read_rule',
    description:
      'Read the full verbatim text of one rule, including its section title and any section-level notes.',
    schema: z.object({ ruleId: z.string().min(1) })
  }
);
