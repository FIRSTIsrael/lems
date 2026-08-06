import { getMissions, readMission } from './missions';
import { getRules, readRule } from './rules';
import { getUpdates, readUpdate } from './updates';
import { evaluateScore } from './evaluate-score';
import { askClarifyingQuestion } from './ask-clarifying-question';
import { semanticSearch } from './semantic-search';
import {
  getGlossaryTerms,
  readChallengeKit,
  readFieldSetup,
  readGlossaryTerm,
  readGraciousProfessionalism,
  readTableInstructions
} from './reference-docs';

export const gameRulesTools = [
  getMissions,
  readMission,
  getRules,
  readRule,
  getUpdates,
  readUpdate,
  evaluateScore,
  askClarifyingQuestion,
  semanticSearch,
  getGlossaryTerms,
  readGlossaryTerm,
  readChallengeKit,
  readFieldSetup,
  readGraciousProfessionalism,
  readTableInstructions
];

export * from './missions';
export * from './rules';
export * from './updates';
export * from './evaluate-score';
export * from './ask-clarifying-question';
export * from './semantic-search';
export * from './reference-docs';
