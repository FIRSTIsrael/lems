import { RubricsSchema } from './types';

export const rubricColumns = ['beginning', 'developing', 'accomplished', 'exceeds'] as const;

export const rubrics: RubricsSchema = {
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
