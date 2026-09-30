import { getMissions, readMission } from './missions';
import { getRules, readRule } from './rules';
import { getUpdates, readUpdate } from './updates';
import { evaluateScore } from './evaluate-score';
import { askClarifyingQuestion } from './ask-clarifying-question';
import { formulateAnswer } from './formulate-answer';
import { semanticSearch } from './semantic-search';
import {
  getGlossaryTerms,
  readChallengeKit,
  readFieldSetup,
  readGeneralNotes,
  readGlossaryTerm,
  readGraciousProfessionalism,
  readTableInstructions
} from './reference-docs';

export const gameRulesTools = [
  getGlossaryTerms,
  readGlossaryTerm,
  readFieldSetup,
  readChallengeKit,
  readGraciousProfessionalism,
  readTableInstructions,
  readGeneralNotes,
  getMissions,
  readMission,
  getRules,
  readRule,
  getUpdates,
  readUpdate,
  evaluateScore,
  askClarifyingQuestion,
  formulateAnswer,
  semanticSearch
];

export * from './missions';
export * from './rules';
export * from './updates';
export * from './evaluate-score';
export * from './ask-clarifying-question';
export * from './formulate-answer';
export * from './semantic-search';
export * from './reference-docs';
