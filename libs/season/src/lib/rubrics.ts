import { WithId } from 'mongodb';
import { JudgingCategory, Rubric, RubricValue } from '@lems/types';
import { rubricsSchemas } from './localization/rubrics/index';
import { RubricSchemaSection, RubricsSchema } from './localization/rubrics/typing';

export const inferCvrubricSchema = (): RubricsSchema => {
  const inferredSchemaSections: RubricSchemaSection[] = [
    {
      title: 'זיהוי',
      description: '',
      fields: [
        {
          id: 'ip-research',
          title: 'מחקר'
        },
        {
          id: 'rd-resources',
          title: 'שימוש במשאבים'
        }
      ]
    },
    {
      title: 'תכנון',
      description: '',
      fields: [
        {
          id: 'rd-ideation',
          title: 'רעיונות'
        },
        {
          id: 'ip-participation',
          title: 'השתתפות בתהליך'
        }
      ]
    },
    {
      title: 'יצירה',
      description: '',
      fields: [
        {
          id: 'ip-innovation',
          title: 'חדשנות'
        }
      ]
    },
    {
      title: 'חזרה ושינוי',
      description: '',
      fields: [
        {
          id: 'rd-improvements',
          title: 'שיפורים'
        }
      ]
    },
    {
      title: 'הצגה',
      description:
        'הקבוצה שיתפה במצגת תכליתית את הפתרון שלה ואת השפעתו על אחרים, וחגגה את ההתקדמות שלה.',
      fields: [
        {
          id: 'ip-explanation',
          title: 'הסבר'
        },
        {
          id: 'ip-excitement',
          title: 'התלהבות'
        },
        {
          id: 'rd-explanation',
          title: 'הסבר'
        },
        {
          id: 'rd-excitement',
          title: 'התלהבות'
        }
      ]
    }
  ];

  return {
    ...rubricsSchemas['core-values'],
    sections: inferredSchemaSections
  };
};

export const getCvFieldIds = () => {
  const ipFields = rubricsSchemas['innovation-project'].sections
    .flatMap(section => section.fields)
    .filter(field => field.isCoreValuesField)
    .map(field => field.id);

  const rdFields = rubricsSchemas['robot-design'].sections
    .flatMap(section => section.fields)
    .filter(field => field.isCoreValuesField)
    .map(field => field.id);

  return { 'innovation-project': ipFields, 'robot-design': rdFields };
};

export const makeCvValuesForAllRubrics = (rubrics: Array<WithId<Rubric<JudgingCategory>>>) => {
  const result = rubrics.map(rubric => {
    if (rubric.category !== 'core-values') return rubric;
    return makeCvValuesForRubric(rubric as WithId<Rubric<'core-values'>>, rubrics);
  });
  return result;
};

export const makeCvValuesForRubric = (
  rubric: WithId<Rubric<'core-values'>>,
  allRubrics: Array<WithId<Rubric<JudgingCategory>>>
) => {
  const ipRubric = allRubrics.find(
    r => r.category === 'innovation-project' && String(r.teamId) === String(rubric.teamId)
  ) as unknown as WithId<Rubric<'innovation-project'>>;
  const rdRubric = allRubrics.find(
    r => r.category === 'robot-design' && String(r.teamId) === String(rubric.teamId)
  ) as unknown as WithId<Rubric<'robot-design'>>;
  return {
    ...rubric,
    data: { ...rubric.data, values: getCvValues(ipRubric, rdRubric) }
  } as WithId<Rubric<JudgingCategory>>;
};

const getCvValues = (
  innovationProjectRubric: Rubric<'innovation-project'>,
  robotDesignRubric: Rubric<'robot-design'>
): { [key: string]: RubricValue } => {
  const cvFieldIds = getCvFieldIds();

  const cvValues = {
    'innovation-project': cvFieldIds['innovation-project'].reduce(
      (acc, fieldId) => ({
        ...acc,
        ['ip-' + fieldId]: innovationProjectRubric.data?.values?.[fieldId] ?? { value: 0 }
      }),
      {}
    ),
    'robot-design': cvFieldIds['robot-design'].reduce(
      (acc, fieldId) => ({
        ...acc,
        ['rd-' + fieldId]: robotDesignRubric.data?.values?.[fieldId] ?? { value: 0 }
      }),
      {}
    )
  };

  return { ...cvValues['innovation-project'], ...cvValues['robot-design'] };
};
