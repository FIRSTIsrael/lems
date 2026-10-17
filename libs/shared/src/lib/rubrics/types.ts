export interface RubricCategorySchema {
  awards?: boolean;
  sections: {
    id: string;
    fields: {
      id: string;
      coreValues?: boolean;
    }[];
  }[];
  feedback?: boolean;
  /**
   * 'levels' (default): each field has its own text per level (Founders).
   * 'criteria': each field is a single criterion sentence rated on plain level columns (Future).
   */
  layout?: 'levels' | 'criteria';
}

export interface RubricsSchema {
  _version: string;
  'core-values': RubricCategorySchema;
  'innovation-project': RubricCategorySchema;
  'robot-design': RubricCategorySchema;
}
