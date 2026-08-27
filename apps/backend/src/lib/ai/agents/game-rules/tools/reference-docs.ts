import { tool } from 'langchain';
import { z } from 'zod';
import {
  getChallengeKit,
  getFieldSetup,
  getGeneralNotes,
  getGlossaryTerm,
  getGraciousProfessionalism,
  getTableInstructions,
  listGlossaryTerms
} from '../corpus';

export const getGlossaryTerms = tool(async () => listGlossaryTerms(), {
  name: 'get_glossary_terms',
  description:
    'List all glossary term ids and their Hebrew term names. Use this early whenever the user wording may be informal, mixed up, or ambiguous so you can map it to the official term before reading rules.',
  schema: z.object({})
});

export const readGlossaryTerm = tool(
  async ({ termId }) => {
    const term = getGlossaryTerm(termId);
    if (!term) throw new Error(`Unknown glossary term id: ${termId}`);
    return term;
  },
  {
    name: 'read_glossary_term',
    description:
      'Read the full verbatim definition of one rulebook glossary term. Use this before applying rules when the user wording needs a term-level interpretation.',
    schema: z.object({ termId: z.string().min(1) })
  }
);

export const readChallengeKit = tool(async () => getChallengeKit(), {
  name: 'read_challenge_kit',
  description:
    'Read the verbatim "in the challenge kit" section: which bag numbers build which mission models, and related setup notes.',
  schema: z.object({})
});

export const readFieldSetup = tool(async () => getFieldSetup(), {
  name: 'read_field_setup',
  description:
    'Read the verbatim "getting started" field-setup guidance: helpful resources and step-by-step field/mat/mission-model setup, including video clarifications.',
  schema: z.object({})
});

export const readGraciousProfessionalism = tool(async () => getGraciousProfessionalism(), {
  name: 'read_gracious_professionalism',
  description:
    'Read the verbatim Gracious Professionalism rubric text and score levels (developing/accomplished/exceeds) used during robot game matches.',
  schema: z.object({})
});

export const readTableInstructions = tool(async () => getTableInstructions(), {
  name: 'read_table_instructions',
  description:
    'Read the verbatim official competition table build instructions: dimensions, parts, and tournament arrangement.',
  schema: z.object({})
});

export const readGeneralNotes = tool(async () => getGeneralNotes(), {
  name: 'read_general_notes',
  description:
    'Read the cross-mission general notes: the verbatim "no equipment contact" rule text (with the ' +
    'list of missions it applies to, relatedRuleIds, and a non-verbatim unofficialClarification on what ' +
    'counts as a separate mission model for that rule - never quote unofficialClarification as official ' +
    'rule text), and the docking-station note for missions 13-15. Call this whenever a mission has ' +
    'noEquipmentContact: true and equipment/model contact is at issue.',
  schema: z.object({})
});
