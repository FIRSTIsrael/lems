interface RubricSchema {
  sections: Array<{
    id: string;
    fields: Array<{ id: string; coreValues?: boolean }>;
  }>;
  feedback?: boolean;
}

export interface Rubric {
  divisionName: string;
  teamNumber: number;
  teamName: string;
  rubricCategory: string;
  seasonName: string;
  eventName: string;
  scores: Record<string, number | null>;
  status?: string;
  feedback?: { greatJob: string; thinkAbout: string };
  schema?: RubricSchema;
  translations?: {
    sections: Record<
      string,
      {
        title: string;
        description: string;
        fields: Record<
          string,
          {
            beginning: string;
            developing: string;
            accomplished: string;
          }
        >;
      }
    >;
  };
}

export interface OptionalAward {
  id: string;
  name: string;
  description?: string;
}
