import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { JudgingCategory } from '@lems/types/judging';
import { getRubrics } from '@lems/shared/rubrics';
import type { Edition } from '@lems/shared/edition';
import { useToolEdition } from '../../hooks/use-tool-edition';
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

const getRubricKey = (edition: Edition, category: JudgingCategory) =>
  edition === 'founders' ? `rubric-${category}` : `rubric-${edition}-${category}`;

export const useRubric = (category: JudgingCategory) => {
  const edition = useToolEdition();
  const rubricsVersion = getRubrics(edition)._version;
  const [rubric, setRubric] = useState<RubricData>(() => ({
    id: getRubricKey(edition, category),
    version: rubricsVersion,
    category,
    values: getEmptyRubric(edition, category)
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

      const rubricKey = getRubricKey(edition, category);
      const currentRubric = await db.get('rubrics', rubricKey);
      if (
        currentRubric &&
        currentRubric.version === rubricsVersion &&
        currentRubric.category === category
      ) {
        setRubric(currentRubric);
      } else {
        setRubric({
          id: rubricKey,
          version: rubricsVersion,
          category,
          values: getEmptyRubric(edition, category)
        });
      }
      setLoading(false);
    };

    initDb();
  }, [edition, category, rubricsVersion]);

  const updateRubric = async (values: RubricFormValues) => {
    const newRubric: RubricData = {
      id: getRubricKey(edition, category),
      version: rubricsVersion,
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
    await store.delete(getRubricKey(edition, category));
    await tx.done;
    setRubric({
      id: getRubricKey(edition, category),
      version: rubricsVersion,
      category,
      values: getEmptyRubric(edition, category)
    });
  };

  return { rubric, updateRubric, resetRubric, loading };
};
