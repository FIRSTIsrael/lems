// Typed access over the verbatim game-rules corpus (apps/backend/src/lib/ai/corpus/game-rules).
// Corpus is Hebrew-only for now; loaders take no locale argument until an English corpus exists.
import {
  challengeKitData,
  fieldSetupData,
  glossaryData,
  graciousProfessionalismData,
  missionsData,
  rulesData,
  tableInstructionsData,
  updatesData
} from '../../corpus/game-rules';
import { GlossaryTerm, Mission, Rule, RuleSection, Update, GeneralNotes } from './types';

const missions = missionsData.missions as Mission[];
const sections = rulesData.sections as RuleSection[];
const rules = rulesData.rules as Rule[];
const updates = updatesData.updates as Update[];
const generalNotes = missionsData.generalNotes as GeneralNotes;

const sectionsById = new Map(sections.map(section => [section.id, section]));

export function listMissions(): Array<Pick<Mission, 'id' | 'nameHe' | 'nameEn'>> {
  return missions.map(({ id, nameHe, nameEn }) => ({ id, nameHe, nameEn }));
}

export function getMission(id: string): Mission | undefined {
  return missions.find(mission => mission.id === id);
}

/** Cross-mission notes referenced by `noEquipmentContact`/`dockingStation` flags - not per-mission. */
export function getGeneralNotes(): GeneralNotes {
  return generalNotes;
}

export function listRules(): Array<Pick<Rule, 'id' | 'ruleNumber' | 'sectionId'>> {
  return rules.map(({ id, ruleNumber, sectionId }) => ({ id, ruleNumber, sectionId }));
}

export function getRule(id: string): (Rule & { section?: RuleSection }) | undefined {
  const rule = rules.find(r => r.id === id);
  if (!rule) return undefined;
  return { ...rule, section: sectionsById.get(rule.sectionId) };
}

export function listUpdates(): Array<Pick<Update, 'id' | 'name' | 'date'>> {
  return updates.map(({ id, name, date }) => ({ id, name, date }));
}

export function getUpdate(id: string): Update | undefined {
  return updates.find(update => update.id === id);
}

/** All per-mission localized error descriptions, keyed by ScoresheetError id (e.g. "m01-e1"). */
export function getMissionErrorDescriptions(): Record<string, string> {
  const descriptions: Record<string, string> = {};
  for (const mission of missions) {
    for (const error of mission.errors) descriptions[error.id] = error.description;
  }
  return descriptions;
}

const glossaryTerms = glossaryData.terms as GlossaryTerm[];

export function listGlossaryTerms(): Array<Pick<GlossaryTerm, 'id' | 'termHe'>> {
  return glossaryTerms.map(({ id, termHe }) => ({ id, termHe }));
}

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find(term => term.id === id);
}

// The remaining reference docs (challenge kit, field setup, gracious professionalism rubric,
// table instructions) are each a single verbatim document rather than a lookup-by-id collection,
// so they're exposed as-is. field-setup is prose, so it's markdown text rather than JSON.
export function getChallengeKit() {
  return challengeKitData;
}

export function getFieldSetup(): string {
  return fieldSetupData;
}

export function getGraciousProfessionalism() {
  return graciousProfessionalismData;
}

export function getTableInstructions() {
  return tableInstructionsData;
}
