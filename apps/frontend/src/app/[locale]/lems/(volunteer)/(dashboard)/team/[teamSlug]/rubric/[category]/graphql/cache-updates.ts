import type { ApolloCache } from '@apollo/client';
import type { Edition } from '@lems/shared/edition';
import { merge, updateById, underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { getEmptyRubric } from '../rubric-utils';
import type { RubricItem } from './types';

export function createUpdateRubricValueCacheUpdate(
  edition: Edition,
  rubricId: string,
  fieldId: string,
  fieldValue: { value: number; notes?: string }
) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as {
            judging?: { rubrics?: RubricItem[] };
          };
          if (!division.judging?.rubrics) {
            return existingDivision;
          }

          return merge(existingDivision, {
            judging: {
              rubrics: updateById(division.judging.rubrics, rubricId, rubric =>
                merge(rubric, {
                  data: merge(
                    rubric.data ||
                      getEmptyRubric(
                        edition,
                        underscoresToHyphens(rubric.category) as JudgingCategory
                      ),
                    {
                      fields: {
                        ...(rubric.data?.fields || {}),
                        [fieldId]: fieldValue
                      }
                    }
                  )
                })
              )
            }
          });
        }
      }
    });
  };
}

export function createUpdateRubricFeedbackCacheUpdate(
  edition: Edition,
  rubricId: string,
  feedback: { greatJob: string; thinkAbout: string }
) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as {
            judging?: { rubrics?: RubricItem[] };
          };
          if (!division.judging?.rubrics) {
            return existingDivision;
          }

          return merge(existingDivision, {
            judging: {
              rubrics: updateById(division.judging.rubrics, rubricId, rubric =>
                merge(rubric, {
                  data: merge(
                    rubric.data ||
                      getEmptyRubric(
                        edition,
                        underscoresToHyphens(rubric.category) as JudgingCategory
                      ),
                    {
                      feedback
                    }
                  )
                })
              )
            }
          });
        }
      }
    });
  };
}
