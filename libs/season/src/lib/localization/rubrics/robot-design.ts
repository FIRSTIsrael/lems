import { SEASON_NAME, JudgingCategory } from '@lems/types';
import { localizedJudgingCategory } from '../judging';
import { RubricsSchema, RubricSchemaSection } from './typing';
import { rubricSchemaColumns, rubricSchemaFeedbackFields } from './common';

const category = 'robot-design' as JudgingCategory;

const rubricSections: Array<RubricSchemaSection> = [
  {
    title: 'זיהוי',
    description:
      'הקבוצה הגדירה אילו משימות תנסה לפתור, חקרה משאבים של בנייה ותכנות ונעזרה בהנחייה על פי הצורך.',
    fields: [
      {
        id: 'strategy',
        title: 'אסטרטגיה',
        label_1: 'עדות מינימלית לאסטרטגיית משימה',
        label_2: 'עדות חלקית לאסטרטגיית משימה',
        label_3: 'עדות ניכרת לאסטרטגיית משימה'
      },
      {
        id: 'resources',
        title: 'שימוש במשאבים',
        isCoreValuesField: true,
        label_1: 'שימיש מינימלי במשאבי בנייה ותכנות',
        label_2: 'שימיש מוגבל במשאבי בנייה ותכנות',
        label_3: 'שימיש ניכר במשאבי בנייה ותכנות לתמיכה באסטרטגיית המשימה'
      }
    ]
  },
  {
    title: 'תכנון',
    description: 'הקבוצה עבדה ביחד על תכנון הרובוט ופיתחה את המיומנויות הנדרשות של בנייה ותכנות.',
    fields: [
      {
        id: 'ideation',
        title: 'רעיונות',
        isCoreValuesField: true,
        label_1: 'עדות מינימלית שכל חברי הקבוצה תרמו רעיונות',
        label_2: 'עדות חלקית שכל חברי הקבוצה תרמו רעיונות',
        label_3: 'עדות ניכרת שכל חברי הקבוצה תרמו רעיונות'
      },
      {
        id: 'skills',
        title: 'מיומנויות',
        label_1: 'עדות מינימלית למיומנויות בנייה ותכנות אצל כל חברי הקבוצה',
        label_2: 'עדות חלקית למיומנויות בנייה ותכנות אצל כל חברי הקבוצה',
        label_3: 'עדות ניכרת למיומנויות בנייה ותכנות אצל כל חברי הקבוצה'
      }
    ]
  },
  {
    title: 'יצירה',
    description:
      'הקבוצה פיתחה תכנונים הנדסיים מקוריים או שיפרה תכנונים קיימים בהתאם לאסטרטגיית המשימה שלה.',
    fields: [
      {
        id: 'attachments',
        title: 'תוספות',
        label_1: 'הסבר לא ברור של התוספות והייעוד שלהם',
        label_2: 'הסבר פשטני של התוספות והייעוד שלהם',
        label_3: 'הסבר מפורט של התוספות החדשניות והייעוד שלהם'
      },
      {
        id: 'code',
        title: 'תוכנה',
        label_1: 'הסבר לא ברור של התוכנה ו/או שימוש בחיישנים',
        label_2: 'הסבר פשטני של התוכנה ו/או שימוש בחיישנים',
        label_3: 'הסבר מפורט של התוכנה ו/או שימוש חדשני בחיישנים'
      }
    ]
  },
  {
    title: 'חזרה ושינוי',
    description:
      'הקבוצה ביצעה בדיקות חוזרות של הרובוט והתוכנה במטרה לזהות תחומים שדורשים שיפור ושילבה את הממצאים בפתרונות שלה.',
    fields: [
      {
        id: 'testing',
        title: 'בדיקות',
        label_1: 'עדות מינימלית לבדיקות הרובוט והתוכנה',
        label_2: 'עדות חלקית לבדיקות הרובוט והתוכנה',
        label_3: 'עדות ניכרת לבדיקות חוזרות של הרובוט והתוכנה'
      },
      {
        id: 'improvements',
        title: 'שיפורים',
        isCoreValuesField: true,
        label_1: 'עדות מינימלית לשיפורים שהוכנסו בעקבות הבדיקות',
        label_2: 'עדות חלקית לשיפורים שהוכנסו בעקבות הבדיקות',
        label_3: 'עדות ניכרת לשיפורים שהוכנסו בעקבות הבדיקות'
      }
    ]
  },
  {
    title: 'הצגה',
    description: 'הקבוצה הסבירה באופן תכליתי מה היא למדה מתהליך תכנון הרובוט וחגגה את התקדמותה.',
    fields: [
      {
        id: 'explanation',
        title: 'הסבר',
        isCoreValuesField: true,
        label_1: 'הסבר לא ברור של התהליך והפקת לקחים',
        label_2: 'הסבר פשטני של התהליך והפקת לקחים',
        label_3: 'הסבר מפורט של התהליך והפקת לקחים'
      },
      {
        id: 'excitement',
        title: 'התלהבות',
        isCoreValuesField: true,
        label_1: 'הקבוצה מדגימה גאווה או התלהבות מינימלית מהעבודה שלה',
        label_2: 'הקבוצה מדגימה גאווה או התלהבות חלקית מהעבודה שלה',
        label_3: 'הקבוצה מדגימה גאווה או התלהבות ניכרת מהעבודה שלה'
      }
    ]
  }
];

const robotDesignRubric: RubricsSchema = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    'על הקבוצה להציג בפני השופטים את הישגיה בכל אחד מהקריטריונים הבאים. יש למלא את מחוון השיפוט על פי ההצגה של תכנון הרובוט. השופטים **נדרשים** לסמן תיבת סימון אחת בכל שורה בנפרד על מנת לציין את רמת ההישגים של הקבוצה. אם הקבוצה **מצטיינת**, נדרש נימוק קצר בעמודה זו.',
  columns: rubricSchemaColumns,
  sections: rubricSections,
  feedback: {
    description: 'מה הייתה גישת הקבוצה לפתרון משימות הרובוט בעזרת בנייה ותכנות?',
    fields: rubricSchemaFeedbackFields
  },
  cvDescription:
    '*קריטריונים עם תיבת סימון זו נחשבים פעמיים בעת קביעת המועמדות לפרסים - גם להערכת **תכנון הרובוט** וגם להערכת **ערכי הליבה**.*'
};

export default robotDesignRubric;
