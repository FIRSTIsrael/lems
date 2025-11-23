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
}

export interface RubricsSchema {
  'core-values': RubricCategorySchema;
  'innovation-project': RubricCategorySchema;
  'robot-design': RubricCategorySchema;
}
