import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { JudgingCategory } from '@lems/types/judging';
import { rubrics } from '@lems/shared/rubrics';
import { RubricFormValues } from '../rubric-types';
import { getEmptyRubric } from '../rubric-utils';

export interface RubricData {
  id: string;
  version: string;
  category: JudgingCategory;
  values: RubricFormValues;
}

interface RubricsDb extends DBSchema {
  rubrics: {
    key: string;
    value: RubricData;
  };
}

const getRubricKey = (category: JudgingCategory) => `rubric-${category}`;

export const useRubric = (category: JudgingCategory) => {
  const [rubric, setRubric] = useState<RubricData>(() => ({
    id: getRubricKey(category),
    version: rubrics._version,
    category,
    values: getEmptyRubric(category)
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDb = async () => {
      const db = await openDB<RubricsDb>('rubrics-database', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('rubrics')) {
            db.createObjectStore('rubrics', { keyPath: 'id', autoIncrement: false });
          }
        }
      });

      const rubricKey = getRubricKey(category);
      const currentRubric = await db.get('rubrics', rubricKey);
      if (
        currentRubric &&
        currentRubric.version === rubrics._version &&
        currentRubric.category === category
      ) {
        setRubric(currentRubric);
      } else {
        setRubric({
          id: rubricKey,
          version: rubrics._version,
          category,
          values: getEmptyRubric(category)
        });
      }
      setLoading(false);
    };

    initDb();
  }, [category]);

  const updateRubric = async (values: RubricFormValues) => {
    const newRubric: RubricData = {
      id: getRubricKey(category),
      version: rubrics._version,
      category,
      values
    };

    const db = await openDB<RubricsDb>('rubrics-database', 1);
    const tx = db.transaction('rubrics', 'readwrite');
    const store = tx.objectStore('rubrics');
    await store.put(newRubric);
    await tx.done;

    setRubric(newRubric);
  };

  const resetRubric = async () => {
    const db = await openDB<RubricsDb>('rubrics-database', 1);
    const tx = db.transaction('rubrics', 'readwrite');
    const store = tx.objectStore('rubrics');
    await store.clear();
    await tx.done;
    setRubric({
      id: getRubricKey(category),
      version: rubrics._version,
      category,
      values: getEmptyRubric(category)
    });
  };

  return { rubric, updateRubric, resetRubric, loading };
};
