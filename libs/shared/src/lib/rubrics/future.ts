import type { RubricsSchema } from './types';

export const futureRubrics: RubricsSchema = {
  _version: '2026-future-1',
  'core-values': {
    awards: true,
    sections: [],
    feedback: true
  },
  'innovation-project': {
    layout: 'criteria',
    sections: [
      { id: 'explore', fields: [{ id: 'guided-research' }, { id: 'sources', coreValues: true }] },
      {
        id: 'ideate',
        fields: [{ id: 'ideas' }, { id: 'iteration' }, { id: 'innovation', coreValues: true }]
      },
      {
        id: 'implement',
        fields: [{ id: 'impact', coreValues: true }, { id: 'steps' }, { id: 'feasibility' }]
      },
      { id: 'communicate', fields: [{ id: 'visuals' }, { id: 'contribution', coreValues: true }] }
    ],
    feedback: true
  },
  'robot-design': {
    layout: 'criteria',
    sections: [
      {
        id: 'identify',
        fields: [{ id: 'resources' }, { id: 'improvement-areas', coreValues: true }]
      },
      {
        id: 'design-create',
        fields: [{ id: 'mission-strategy' }, { id: 'mechanical' }, { id: 'coding' }]
      },
      {
        id: 'iterate',
        fields: [{ id: 'options' }, { id: 'testing-process' }, { id: 'improve', coreValues: true }]
      },
      {
        id: 'communicate',
        fields: [
          { id: 'cooperative-strategy', coreValues: true },
          { id: 'contribution', coreValues: true }
        ]
      }
    ],
    feedback: true
  }
};
