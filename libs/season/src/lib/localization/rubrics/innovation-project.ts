import { SEASON_NAME, JudgingCategory } from '@lems/types';
import { localizedJudgingCategory } from '../judging';
import { RubricsSchema, RubricSchemaSection } from './typing';
import { rubricSchemaColumns, rubricSchemaFeedbackFields } from './common';

const category = 'innovation-project' as JudgingCategory;

const rubricSections: Array<RubricSchemaSection> = [
  {
    title: 'זיהוי',
    description: 'הקבוצה הגדירה את הבעיה באופן ברור וחקרה אותה היטב.',
    fields: [
      {
        id: 'problem',
        title: 'הגדרת הבעיה',
        label_1: 'הגדרת הבעיה אינה ברורב',
        label_2: 'הגדרת הבעיה ברורה באופן חלקי',
        label_3: 'הגדרת הבעיה ברורה'
      },
      {
        id: 'research',
        title: 'מחקר',
        isCoreValuesField: true,
        label_1: 'עדות מינימלית למחקר',
        label_2: 'עדות חלקית למחקר על סמך מקור אחד או יותר',
        label_3: 'מחקר ברור ומפורט על סמך מגוון מקורות מידע'
      }
    ]
  },
  {
    title: 'תכנון',
    description: 'הקבוצה בנתה ביחד את תוכנית הפרויקט ופיתחה ביתד את רעיונותיה.',
    fields: [
      {
        id: 'plan',
        title: 'תכנון תכליתי',
        label_1: 'עדות מינימלית לתוכנית עבודה תכליתית',
        label_2: 'עדות חלקית לתוכנית עבודה תכליתית',
        label_3: 'עדות ניכרת לתוכנית עבודה תכליתית'
      },
      {
        id: 'participation',
        title: 'השתתפות בתהליך',
        isCoreValuesField: true,
        label_1: 'עדות מינימלית שכל חברי הקבוצה השתתפו בתהליך הפיתוח',
        label_2: 'עדות חלקית שכל חברי הקבוצה השתתפו בתהליך הפיתוח',
        label_3: 'עדות ניכרת שכל חברי הקבוצה השתתפו בתהליך הפיתוח'
      }
    ]
  },
  {
    title: 'יצירה',
    description:
      'הקבוצה פיתחה רעיון מקורי או התבססה על אחד קיים, תוך הכנת דגם או סרטוט של אב-הטיפוס לשם הצגת הפתרון.',
    fields: [
      {
        id: 'innovation',
        title: 'חדשנות',
        isCoreValuesField: true,
        label_1: 'הסבר מינימלי של חדשנות הפתרון',
        label_2: 'הסבר פשטני של חדשנות הפתרון',
        label_3: 'הסבר מפורט של חדשנות הפתרון'
      },
      {
        id: 'model',
        title: 'דגם',
        label_1: 'דגם או סרטוט של הפתרון אינו ברור',
        label_2: 'דגם או סרטוט פשוט של הפתרון',
        label_3: 'דגם או סרטוט מפורט של הפתרון'
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
        label_1: 'שיתוף מינימלי של הפתרון עם אחרים',
        label_2: 'הפתרון שותף עם לפחות אדם אחד או קבוצה אחת',
        label_3: 'הפתרון שותף עם אנשים רבים או קבוצות רבות'
      },
      {
        id: 'improvements',
        title: 'שיפורים',
        label_1: 'עדות מינימלית לשיפורים על סמך המשוב',
        label_2: 'עדות חלקית לשיפורים על סמך המשוב',
        label_3: 'עדות ניכרת לשיפורים על סמך המשוב'
      }
    ]
  },
  {
    title: 'הצגה',
    description:
      'הקבוצה שיתפה במצגת תכליתית את הפתרון שלה ואת השפעתו על אחרים, וחגגה את ההתקדמות שלה.',
    fields: [
      {
        id: 'explanation',
        title: 'הסבר',
        isCoreValuesField: true,
        label_1: 'הסבר הפתרון והשפעתו על אחרים אינם ברורים',
        label_2: 'הסבר הפתרון והשפעתו על אחרים ברורים חלקית',
        label_3: 'הסבר הפתרון והשפעתו על אחרים ברורים לחלוטין'
      },
      {
        id: 'excitement',
        title: 'התלהבות',
        isCoreValuesField: true,
        label_1: 'הקבוצה מגדימה גאווה או התלהבות באופן מינימלי',
        label_2: 'הקבוצה מגדימה גאווה או התלהבות באופן חלקי',
        label_3: 'הקבוצה מגדימה גאווה או התלהבות באופן ניכר'
      }
    ]
  }
];

const innovationProjectRubric: RubricsSchema = {
  category: category,
  season: SEASON_NAME,
  title: localizedJudgingCategory[category].name,
  description:
    'על הקבוצה להציג בפני השופטים את הישגיה בכל אחד מהקריטריונים הבאים. יש למלא את מחוון השיפוט על פי ההצגה של פרויקט החדשנות. השופטים **נדרשים** לסמן תיבת סימון אחת בכל שורה בנפרד על מנת לציין את רמת ההישגים של הקבוצה. אם הקבוצה **מצטיינת**, נדרש נימוק קצר בעמודה זו.**',
  columns: rubricSchemaColumns,
  sections: rubricSections,
  feedback: {
    description: 'כיצד הקבוצה זיהתה בעיה הקשורה לנושא של העונה וניגשה לפתור אותה?',
    fields: rubricSchemaFeedbackFields
  },
  cvDescription:
    '*קריטריונים עם תיבת סימון זו נחשבים פעמיים בעת קביעת המועמדות לפרסים - גם להערכת **פרויקט החדשנות** וגם להערכת **ערכי הליבה**.*'
};

export default innovationProjectRubric;
