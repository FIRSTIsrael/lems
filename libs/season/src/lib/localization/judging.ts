import { JudgingCategory, AwardNames } from '@lems/types';

export const localizedJudgingCategory: {
  [key in JudgingCategory]: { name: string };
} = {
  'innovation-project': { name: 'פרויקט החדשנות' },
  'robot-design': { name: 'תכנון הרובוט' },
  'core-values': { name: 'ערכי הליבה' }
};

export const localizedAward: {
  [key in AwardNames]: { name: string; description: string };
} = {
  coreValues: {
    name: 'ערכי הליבה',
    description:
      'פרס ערכי הליבה מוענק לקבוצה המדגימה התלהבות ורוח צוות יוצאים מן הכלל, יודעת שניתן להשיג יותר כקבוצה מאשר כבודדים ומציגה כל הזמן כבוד הדדי אחד כלפי השני וכלפי קבוצות אחרות.'
  },
  innovationProject: {
    name: 'פרויקט החדשנות',
    description:
      'פרס ערכי הליבה מוענק לקבוצה המדגימה התלהבות ורוח צוות יוצאים מן הכלל, יודעת שניתן להשיג יותר כקבוצה מאשר כבודדים ומציגה כל הזמן כבוד הדדי אחד כלפי השני וכלפי קבוצות אחרות.'
  },
  leadMentor: {
    name: 'המנטור המצטיין',
    description:
      'מנטורים, מדריכים ומורים נותנים לקבוצות השראה להוציא מעצמן את המיטב, כל אחד לחוד וכולם ביחד, ובלעדיהם *FIRST* LEGO League  לא הייתה מתקיימת. פרס זה מוענק למנטור אשר ניכרת מנהיגותו והובלתו של הקבוצה ואשר מדגים בברור את ערכי הליבה של *FIRST*'
  },
  robotDesign: {
    name: 'תכנון הרובוט',
    description:
      'פרס תכנון הרובוט מוענק לקבוצה המשתמשת בעקרונות תכנות וברעיונות הנדסיים יוצאים מן הכלל, על מנת לפתח רובוט חסון, עמיד ויעיל מבחינה מכנית ובעל יכולת גבוהה לבצע את משימות האתגר.'
  },
  breakthrough: {
    name: 'פורצי הדרך',
    description:
      'פרס זה ניתן לקבוצה שהעצימה את ביטחונה העצמי, התקדמה משמעותית גם במשחק הרובוט וגם בפרויקט החדשנות ומהווה דוגמה מזהירה של ערכי ליבה מעולים. ניכר שחברי הקבוצה הבינו שמה שהם מגלים חשוב יותר מהזכייה בפרסים.'
  },
  robotPerformance: {
    name: 'ביצועי הרובוט',
    description:
      'פרס ביצועי הרובוט מוענק לקבוצה אשר השיגה את הניקוד הגבוה ביותר במשחקי הרובוט. לקבוצות ניתנת הזדמנות להתחרות בלפחות שלושה מקצים של 2.5 דקות והניקוד הגבוה ביותר קובע.'
  },
  volunteerOfTheYear: { name: 'מתנדב/ת השנה', description: '' },
  champions: {
    name: 'האליפות',
    description:
      'פרס זה ניתן לקבוצה שמגלמת את חוויית *FIRST* LEGO League  על ידי אימוץ ערכי ליבה תוך הגעה למצוינות ולחדשנות הן במשחק הרובוט והן בפרויקט החדשנות.'
  },
  impact: {
    name: 'ההשפעה',
    description:
      'פרס ההשפעה מוענק לקבוצה שיש לה תרומה ייחודית והשפעה משמעותית ומתמשכת על חיי הקהילה.'
  },
  motivate: {
    name: 'המניעים',
    description:
      'פרס זה ניתן לקבוצה אשר מפנימה את התרבות של *FIRST* LEGO League  על ידי גיבוש הקבוצה, רוח הצוות והדגמת התלהבות.'
  },
  risingAllStar: {
    name: 'הכוכב העולה',
    description: 'פרס זה ניתן לקבוצה שהשופטים מצפים ממנה להגיע להישגים גדולים בעתיד.'
  },
  excellenceInEngineering: {
    name: 'מצוינות הנדסית',
    description:
      'פרס זה ניתן לקבוצה אשר מציגה רובוט מתוכנן ביעילות, פתרון לפרויקט החדשנות שנוגע באופן תכליתי באתגר העונה ושערכי הליבה ניכרים בכל מה שהיא עושה.'
  }
};
