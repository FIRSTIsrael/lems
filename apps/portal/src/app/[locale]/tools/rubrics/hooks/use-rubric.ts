import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { JudgingCategory } from '@lems/types';
import { rubrics } from '@lems/shared/rubrics';
import { RubricFormValues } from '../types/rubric-types';

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
  const [rubric, setRubric] = useState<RubricData | null>(null);
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
      if (currentRubric && currentRubric.version === rubrics._version) {
        setRubric(currentRubric);
      } else {
        setRubric(null);
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
    await store.delete(getRubricKey(category));
    await tx.done;
    setRubric(null);
  };

  return { rubric, updateRubric, resetRubric, loading };
};
