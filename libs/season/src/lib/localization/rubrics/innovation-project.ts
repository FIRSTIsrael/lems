import { SEASON_NAME, JudgingCategory } from '@lems/types';
import { localizedJudgingCategory } from '../judging';
import { RubricsSchema, RubricSchemaSection } from './typing';
import { rubricSchemaColumns, rubricSchemaFeedback } from './common';

const category = 'innovation-project' as JudgingCategory;

const rubricSections: Array<RubricSchemaSection> = [
  {
    title: 'זיהוי',
    description: 'הקבוצה הגדירה את הבעיה באופן ברור וחקרה אותה היטב.',
    fields: [
      {
        id: 'problem',
        title: 'הגדרת הבעיה',
        label_1: 'הבעיה אינה מוגדרת באופן ברור',
        label_2: 'הגדרת הבעיה ברורה באופן חלקי',
        label_3: 'הגדרת הבעיה ברורה'
      },
      {
        id: 'research',
        title: 'מחקר',
        label_1: 'מחקר מינימלי',
        label_2: 'מחקר חלקי, על סמך יותר ממקור מידע אחד',
        label_3: 'מחקר ברור ומפורט, על סמך מגוון מקורות מידע'
      }
    ]
  },
  {
    title: 'תכנון',
    description: 'הקבוצה הפיקה באופן עצמאי מספר רעיונות חדשניים לפני שבחרה ותכננה איזה מהם לפתח.',
    fields: [
      {
        id: 'selection',
        title: 'רעיונות',
        label_1: 'עדות מינימלית לתהליך בחירה משותף',
        label_2: 'עדות חלקית לתהליך בחירה משותף',
        label_3: 'עדות ניכרת לתהליך בחירה משותף'
      },
      {
        id: 'plan',
        title: 'תכנון תכליתי',
        label_1: 'עדות מינימלית לתוכנית עבודה תכליתית',
        label_2: 'עדות חלקית לתוכנית עבודה תכליתית',
        label_3: 'עדות ניכרת לתוכנית עבודה תכליתית'
      }
    ]
  },
  {
    title: 'יצירה',
    description:
      'הקבוצה פיתחה רעיון חדשני או התבססה על אחד קיים, תוך הכנת דגם או סרטוט של אב-הטיפוס לשם הצגת הפתרון.',
    fields: [
      {
        id: 'development',
        title: 'פיתוח',
        label_1: 'פיתוח מינימלי של הפתרון החדשני',
        label_2: 'פיתוח חלקי של הפתרון החדשני',
        label_3: 'פיתוח ניכר של הפתרון החדשני'
      },
      {
        id: 'model',
        title: 'דגם',
        label_1: 'דגם או סרטוט של הפתרון אינו ברור',
        label_2: 'דגם או סרטוט פשוט שעוזר לשתף את הפתרון',
        label_3: 'דגם או סרטוט מפורט שעוזר לשתף את הפתרון'
      }
    ]
  },
  {
    title: 'חזרה ושינוי',
    description: 'הקבוצה שיתפה את הרעיונות שלה, אספה משובים ובעקבותיהם שילבה שיפורים בפתרון.',
    fields: [
      {
        id: 'sharing',
        title: 'שיתוף',
        label_1: 'שיתוף מינימלי של הפתרון',
        label_2: 'שיתפו את הפתרון עם נציג קהל היעד **או** עם מומחה',
        label_3: 'שיתפו את הפתרון עם נציג קהל היעד **וגם** עם מומחה'
      },
      {
        id: 'improvements',
        title: 'שיפורים',
        label_1: 'עדות מינימלית לשילוב שיפורים בפתרון',
        label_2: 'עדות חלקית לשילוב שיפורים בפתרון',
        label_3: 'עדות ניכרת לשילוב שיפורים בפתרון'
      }
    ]
  },
  {
    title: 'הצגה',
    description:
      'הקבוצה שיתפה במצגת יצירתית ותכליתית את הפתרון העדכני שלה ואת השפעתו על המשתמשים בו.',
    fields: [
      {
        id: 'presentation',
        title: 'הצגה',
        label_1: 'הצגת הפרויקט שובה באופן מינימלי',
        label_2: 'הצגת הפרויקט שובה באופן חלקי',
        label_3: 'הצגת הפרויקט שובה'
      },
      {
        id: 'impact',
        title: 'פתרון והשפעה',
        label_1: 'הפתרון והשפעתו האפשרית על אחרים אינם ברורים',
        label_2: 'הפתרון והשפעתו האפשרית על אחרים ברורים חלקית',
        label_3: 'הפתרון והשפעתו האפשרית על אחרים ברורים לחלוטין'
      }
    ]
  }
];

const innovationProjectRubric: RubricsSchema = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    'על הקבוצה להציג בפני השופטים את הישגיה על פי כל אחת מאמות המידה הבאות. יש למלא את המחוון בזמן הצגת פרויקט החדשנות. על השופטים לסמן משבצת אחת בכל שורה, **על מנת להעריך את רמת ההישגים של הקבוצה. אם הקבוצה מדגימה הישגים יוצאים מן הכלל, אנא כתבו הערה קצרה במשבצת מצטיינת**.',
  columns: rubricSchemaColumns,
  sections: rubricSections,
  feedback: rubricSchemaFeedback
};

export default innovationProjectRubric;
