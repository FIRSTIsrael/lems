import { CVFormCategoryNames } from '@lems/types';

export interface CVFormSchemaCategory {
  id: CVFormCategoryNames;
  title: string;
  description?: string;
  emoji: string;
  teamOrStudent: Array<string>;
  anyoneElse: Array<string>;
}

export interface CVFormSchema {
  columns: Array<{ title: string }>;
  categories: Array<CVFormSchemaCategory>;
}
