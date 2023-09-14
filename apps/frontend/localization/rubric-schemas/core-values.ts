import { RubricsSchema } from '.';
import { JudgingCategory, OptionalAwardsTypes, SEASON_NAME } from '@lems/types';
import { localizedJudgingCategory, localizedOptionalAward } from '../judging';

const category = 'core-values' as JudgingCategory;

const coreValuesRubric: RubricsSchema = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    '**ערכי הליבה** צריכים לשמש כזכוכית מגדלת דרכה אתם מסתכלים על הופעת הקבוצה. כל חברי הקבוצה צריכים להדגים את ערכי הליבה בכל דבר שהם עושים. מחוון זה צריך לשמש לתיעוד **ערכי הליבה**, בהם הבחנתם בעת מפגש השיפוט. הערכת ערכי הליבה תתבצע גם במהלך כל **משחק הרובוט**, על ידי ניקוד של **מקצועיות אדיבה®**, אשר יתווסף להערכה כללית של ערכי הליבה.',
  columns: [
    {
      title: 'מתחילה',
      description: 'ניכר באופן מינימלי בין חברי הקבוצה'
    },
    {
      title: 'מתפתחת',
      description: 'ניכר באופן לא עקבי בין חברי הקבוצה'
    },
    {
      title: 'מיומנת',
      description: 'ניכר באופן עקבי בין חברי הקבוצה'
    },
    {
      title: 'מצטיינת'
    }
  ],
  awards: OptionalAwardsTypes.map(id => ({
    id,
    title: localizedOptionalAward[id].name,
    description: localizedOptionalAward[id].name
  })),
  sections: [
    {
      title: 'גילוי',
      description: 'הקבוצה חקרה רעיונות ומיומנויות חדשים.',
      rubrics: [{ id: 'discovery' }]
    },
    {
      title: 'חדשנות',
      description: 'הקבוצה השתמשה ביצירתיות והתמדה על מנת לפתור בעיות.',
      rubrics: [{ id: 'innovation' }]
    },
    {
      title: 'השפעה',
      description: 'הקבוצה יישמה את מה שלמדה כדי לשפר את העולם שלה.',
      rubrics: [{ id: 'impact' }]
    },
    {
      title: 'הכלה',
      description: 'הקבוצה הפגינה כבוד והכילה את השוני שבין חבריה.',
      rubrics: [{ id: 'inclusion' }]
    },
    {
      title: 'עבודת צוות',
      description: 'הקבוצה הדגימה בברור שעבדה כצוות לאורך כל המסע שלה.',
      rubrics: [{ id: 'teamwork' }]
    },
    {
      title: 'הנאה',
      description: 'ניכר שהקבוצה נהנתה וחגגה את ההישגים שלה.',
      rubrics: [{ id: 'fun' }]
    }
  ]
};

export default coreValuesRubric;
