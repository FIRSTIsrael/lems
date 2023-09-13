import { RubricsSchema } from '.';

const coreValuesRubric: RubricsSchema = {
  type: 'core-values',
  season: 'SUPERPOWERED℠',
  title: 'ערכי הליבה',
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
  awards: [
    {
      id: 'breakthrough',
      title: 'פורצי הדרך',
      description:
        'קבוצה שחבריה עשו התקדמות משמעותית ביכולותיהם ובביטחון העצמי שלהם והבינו שמה שהם מגלים חשוב יותר מהפרסים.'
    },
    {
      id: 'risingStar',
      title: 'הכוכב העולה',
      description: 'קבוצה אשר תפסה את תשומת לב השופטים והם צופים לה הישגים גדולים בעתיד.'
    },
    {
      id: 'motivate',
      title: 'המניעים',
      description:
        'קבוצה שמטמיעה את התרבות של _FIRST®_ LEGO® League על ידי גיבוש  קבוצתי, רוח צוות והתלהבות.'
    }
  ],
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
