export interface MissionClause {
  index: number;
  type: 'boolean' | 'enum';
  isBonus: boolean;
  description: string;
  labels?: string[];
}

export interface MissionError {
  id: string;
  description: string;
}

export interface Mission {
  id: string;
  nameHe: string;
  nameEn: string;
  bagNumbers: number[];
  pageInRgr: string;
  noEquipmentContact: boolean;
  description: string;
  scoringText: string;
  clauses: MissionClause[];
  errors: MissionError[];
  remarks: string[];
  /** Non-verbatim supplementary context (e.g. field-observed facts not in the RGR text) - never quote as official rule text. */
  unofficialNotes?: string[];
  videoClarifications?: string[];
  relatedRuleIds?: string[];
}

export interface RuleSection {
  id: string;
  titleHe: string;
  pageInRgr: string;
  ruleIds: string[];
  note?: { title: string; text: string };
  intro?: string;
}

export interface Rule {
  id: string;
  ruleNumber: number;
  sectionId: string;
  text: string;
}

export interface Update {
  id: string;
  name: string;
  date: string | null;
  contents: string;
  clauses: string[];
  blueText: string | null;
  appliesTo: Array<{ type: 'rule' | 'mission'; id: string }>;
  pageInUpdatesFile: string | number | null;
}

export interface GlossaryTerm {
  id: string;
  termHe: string;
  definition: string;
}

/** A cross-mission/cross-rule note, cross-referenced by mission and rule ids for easy lookup. */
export interface NoEquipmentContactRule {
  title: string;
  text: string;
  appliesToMissions: string[];
  relatedRuleIds?: string[];
  /** Non-verbatim supplementary context - never quote as official rule text. */
  unofficialClarification?: string[];
}

export interface DockingStationNote {
  title: string;
  text: string;
  appliesToMissions: string[];
  relatedRuleIds?: string[];
}

export interface GeneralNotes {
  noEquipmentContactRule: NoEquipmentContactRule;
  dockingStationNote: DockingStationNote;
}
