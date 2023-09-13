import { RubricsSchema } from '.';

const robotDesignRubric: RubricsSchema = {
  type: 'robot-design',
  season: 'SUPERPOWERED℠',
  title: 'תכנון הרובוט',
  description:
    'על הקבוצה להציג בפני השופטים את הישגיה על פי כל אחת מאמות המידה הבאות. יש למלא את המחוון בזמן הצגת תכנון הרובוט. על השופטים לסמן משבצת אחת בכל שורה, על מנת להעריך את רמת ההישגים של הקבוצה. אם הקבוצה מדגימה הישגים יוצאים מן הכלל, אנא כתבו הערה קצרה במשבצת מצטיינת.',
  columns: [{ title: 'מתחילה' }, { title: 'מתפתחת' }, { title: 'מיומנת' }, { title: 'מצטיינת' }],
  sections: [
    {
      title: 'זיהוי',
      description:
        'לקבוצה הייתה אסטרטגיית משימה מוגדרת היטב והיא רכשה את מיומנויות הבנייה והתכנות הנדרשות.',
      rubrics: [
        {
          id: 'strategy',
          label_1: 'אסטרטגיית המשימה אינה ברורה',
          label_2: 'אסטרטגיית המשימה ברורה חלקית',
          label_3: 'אסטרטגיית המשימה ברורה'
        },
        {
          id: 'buildingAndCoding',
          label_1: 'עדות מוגבלת למיומנויות בנייה ותכנות אצל כל חברי הקבוצה',
          label_2: 'עדות לא עקבית למיומנויות בנייה ותכנות אצל כל חברי הקבוצה',
          label_3: 'עדות עקבית למיומנויות בנייה ותכנות אצל כל חברי הקבוצה'
        }
      ]
    },
    {
      title: 'תכנון',
      description:
        'הקבוצה הפיקה תכנונים חדשניים ותוכנית עבודה ברורה, תוך השענות על הדרכה על פי הצורך.',
      rubrics: [
        {
          id: 'effectivePlan',
          label_1: 'עדות מינימלית לתוכנית עבודה תכליתית',
          label_2: 'עדות חלקית לתוכנית עבודה תכליתית',
          label_3: 'עדות ברורה לתוכנית עבודה תכליתית'
        },
        {
          id: 'innovativeFeatures',
          label_1: 'הסבר מינימלי של מאפיינים חדשניים של הרובוט והתוכנה',
          label_2: 'הסבר חלקי של מאפיינים חדשניים של הרובוט והתוכנה',
          label_3: 'הסבר ברור של מאפיינים חדשניים של הרובוט והתוכנה'
        }
      ]
    },
    {
      title: 'יצירה',
      description: 'הקבוצה פיתחה רובוט תכליתי ופתרון תכנותי תואם לאסטרטגיית המשימה שלה.',
      rubrics: [
        {
          id: 'functionality',
          label_1: 'הסבר מוגבל של תפקודיות הרובוט, התוספות והחיישנים',
          label_2: 'הסבר פשוט של תפקודיות הרובוט, התוספות והחיישנים',
          label_3: 'הסבר מפורט של תפקודיות הרובוט, התוספות והחיישנים'
        },
        {
          id: 'code',
          label_1: 'הסבר לא ברור כיצד התוכנה מפעילה את הרובוט',
          label_2: 'הסבר ברור חלקית כיצד התוכנה מפעילה את הרובוט',
          label_3: 'הסבר ברור כיצד התוכנה מפעילה את הרובוט'
        }
      ]
    },
    {
      title: 'חזרה ושינוי',
      description:
        'הקבוצה בחנה שוב ושוב את הרובוט והתוכנה שלה על מנת למצוא נקודות לשיפור ושילבה את הממצאים בפתרון.',
      rubrics: [
        {
          id: 'testing',
          label_1: 'עדות מינימלית לבדיקות הרובוט והתוכנה',
          label_2: 'עדות חלקית לבדיקות הרובוט והתוכנה',
          label_3: 'עדות ברורה לבדיקות הרובוט והתוכנה'
        },
        {
          id: 'improve',
          label_1: 'עדות מינימלית שהרובוט והתוכנה עברו שיפורים',
          label_2: 'עדות חלקית שהרובוט והתוכנה עברו שיפורים',
          label_3: 'עדות ברורה שהרובוט והתוכנה עברו שיפורים'
        }
      ]
    },
    {
      title: 'הצגה',
      description:
        'הסבר הקבוצה על תהליך תכנון הרובוט היה תכליתי והדגים כיצד כל חברי הקבוצה היו שותפים בו.',
      rubrics: [
        {
          id: 'designProcess',
          label_1: 'הסבר לא ברור של תהליך תכנון הרובוט',
          label_2: 'הסבר ברור חלקית של תהליך תכנון הרובוט',
          label_3: 'הסבר ברור של תהליך תכנון הרובוט'
        },
        {
          id: 'involvement',
          label_1: 'עדות מינימלית שכל חברי הקבוצה היו מעורבים',
          label_2: 'עדות חלקית שכל חברי הקבוצה היו מעורבים',
          label_3: 'עדות ברורה שכל חברי הקבוצה היו מעורבים'
        }
      ]
    }
  ]
};

export default robotDesignRubric;
