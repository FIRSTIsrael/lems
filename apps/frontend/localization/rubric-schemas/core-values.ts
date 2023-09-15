import { JudgingCategory, OptionalAwardsTypes, SEASON_NAME } from '@lems/types';
import { RubricsSchema, RubricSchemaSection } from './typing';
import { rubricSchemaColumns, rubricSchemaFeedback } from './common';
import { localizedJudgingCategory } from '../judging';
import { localizedOptionalAward } from '../rubrics';

const category = 'core-values' as JudgingCategory;

const rubricSections: RubricSchemaSection<typeof category>[] = [
  {
    title: 'גילוי',
    description: 'הקבוצה חקרה רעיונות ומיומנויות חדשים.',
    fields: [{ id: 'discovery' }]
  },
  {
    title: 'חדשנות',
    description: 'הקבוצה השתמשה ביצירתיות והתמדה על מנת לפתור בעיות.',
    fields: [{ id: 'innovation' }]
  },
  {
    title: 'השפעה',
    description: 'הקבוצה יישמה את מה שלמדה כדי לשפר את העולם שלה.',
    fields: [{ id: 'impact' }]
  },
  {
    title: 'הכלה',
    description: 'הקבוצה הפגינה כבוד והכילה את השוני שבין חבריה.',
    fields: [{ id: 'inclusion' }]
  },
  {
    title: 'עבודת צוות',
    description: 'ניכר שהקבוצה עבדה כצוות לאורך כל המסע שלה.',
    fields: [{ id: 'teamwork' }]
  },
  {
    title: 'הנאה',
    description: 'ניכר שהקבוצה נהנתה וחגגה את ההישגים שלה, כולם ביחד וכל אחד לחוד.',
    fields: [{ id: 'fun' }]
  }
];

const coreValuesRubric: RubricsSchema<typeof category> = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    'ערכי הליבה צריכים לשמש כזכוכית מגדלת דרכה אתם מסתכלים על הופעת הקבוצה. כל חברי הקבוצה צריכים להדגים את ערכי הליבה בכל דבר שהם עושים. מחוון זה צריך לשמש לתיעוד ערכי הליבה, בהם הבחנתם בעת מפגש השיפוט. הערכת ערכי הליבה תתבצע גם במהלך כל משחק הרובוט, על ידי ניקוד של **מקצועיות אדיבה®**, אשר יתווסף להערכה כללית של ערכי הליבה.',
  columns: rubricSchemaColumns,
  awards: OptionalAwardsTypes.map(id => ({
    id,
    title: localizedOptionalAward[id].name,
    description: localizedOptionalAward[id].description
  })),
  sections: rubricSections,
  feedback: rubricSchemaFeedback
};

export default coreValuesRubric;
