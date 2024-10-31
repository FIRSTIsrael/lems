import { WithId } from 'mongodb';
import { JudgingCategory, Rubric, RubricValue } from '@lems/types';
import { rubricsSchemas } from './localization/rubrics/index';

export const getLocalizedCvFields = () => {
  const { 'innovation-project': ipFields, 'robot-design': rdFields } = getCvFieldIds();
  const ipFieldsLocalized = rubricsSchemas['innovation-project'].sections.flatMap(
    section => section.fields
  );
  const rdFieldsLocalized = rubricsSchemas['robot-design'].sections.flatMap(
    section => section.fields
  );
  return [
    ...ipFields.map(field => ({
      field: 'ip-' + field,
      headerName: ipFieldsLocalized.find(f => f.id === field)?.title
    })),
    ...rdFields.map(field => ({
      field: 'rd-' + field,
      headerName: rdFieldsLocalized.find(f => f.id === field)?.title
    }))
  ];
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
