import { JudgingCategory, CoreValuesAwardsTypes, SEASON_NAME } from '@lems/types';
import { RubricsSchema } from './typing';
import { rubricSchemaFeedback } from './common';
import { localizedJudgingCategory } from '../judging';
import { localizedOptionalAward } from '../rubrics';

const category = 'core-values' as JudgingCategory;

const coreValuesRubric: RubricsSchema = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    'ערכי הליבה צריכים לשמש כזכוכית מגדלת דרכה אתם מסתכלים על הופעת הקבוצה. כל חברי הקבוצה צריכים להדגים את ערכי הליבה בכל דבר שהם עושים. מחוון זה צריך לשמש לתיעוד ערכי הליבה, בהם הבחנתם בעת מפגש השיפוט. הערכת ערכי הליבה תתבצע גם במהלך כל משחק הרובוט, על ידי ניקוד של **מקצועיות אדיבה®**, אשר יתווסף להערכה כללית של ערכי הליבה.',
  columns: [],
  awards: CoreValuesAwardsTypes.map(id => ({
    id,
    title: localizedOptionalAward[id].name,
    description: localizedOptionalAward[id].description
  })),
  sections: [],
  feedback: rubricSchemaFeedback,
  showCvDescription: false
};

export default coreValuesRubric;
