import type { Edition } from '../edition';
import { RubricsSchema } from './types';

export const rubricColumns = ['beginning', 'developing', 'accomplished', 'exceeds'] as const;

const rubrics: RubricsSchema = {
  _version: '2025-11-23',
  'core-values': {
    awards: true,
    sections: [],
    feedback: true
  },
  'innovation-project': {
    sections: [
      {
        id: 'identify',
        fields: [{ id: 'problem' }, { id: 'research', coreValues: true }]
      },
      {
        id: 'design',
        fields: [{ id: 'plan' }, { id: 'participation', coreValues: true }]
      },
      {
        id: 'create',
        fields: [{ id: 'innovation', coreValues: true }, { id: 'model' }]
      },
      {
        id: 'iterate',
        fields: [{ id: 'share' }, { id: 'improve' }]
      },
      {
        id: 'communicate',
        fields: [
          { id: 'explanation', coreValues: true },
          { id: 'pride', coreValues: true }
        ]
      }
    ],
    feedback: true
  },
  'robot-design': {
    sections: [
      {
        id: 'identify',
        fields: [{ id: 'strategy' }, { id: 'resources', coreValues: true }]
      },
      {
        id: 'design',
        fields: [{ id: 'contribution', coreValues: true }, { id: 'skills' }]
      },
      {
        id: 'create',
        fields: [{ id: 'attachments' }, { id: 'code' }]
      },
      {
        id: 'iterate',
        fields: [{ id: 'test' }, { id: 'improve', coreValues: true }]
      },
      {
        id: 'communicate',
        fields: [
          { id: 'explanation', coreValues: true },
          { id: 'pride', coreValues: true }
        ]
      }
    ],
    feedback: true
  }
};

export const getRubrics = (edition: Edition): RubricsSchema => {
  switch (edition) {
    case 'future':
      // TODO(future-edition): replace with Future content (phase 3)
      return rubrics;
    case 'founders':
      return rubrics;
  }
};
