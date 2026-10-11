import { ScoresheetSchema, ScoresheetError } from './types';

export const futureScoresheet: ScoresheetSchema = {
  _version: '2026-10-05',
  missions: [
    {
      // Mighty Microbiomes
      id: 'm01',
      clauses: [
        { type: 'enum', options: ['0', '1', '2', '3'], default: '0' },
        { type: 'enum', options: ['0', '1', '2', '3'], default: '0' },
        { type: 'enum', options: ['0', '1', '2', '3'], default: '0' },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3, clause4) => {
        const youngForest = Number(clause1);
        const grandTree = Number(clause2);
        const hollowTree = Number(clause3);
        let points = (youngForest + grandTree + hollowTree) * 20;
        if (clause4) {
          if (youngForest < 3) throw new ScoresheetError('m01-e1');
          points += 40;
        }
        return points;
      }
    },
    {
      // Roots of Renewal
      id: 'm02',
      clauses: [
        { type: 'number', min: 0, max: 40, default: 0 },
        { type: 'number', min: 0, max: 15, default: 0 }
      ],
      calculation: (clause1, clause2) => {
        const grandTreeBase = Number(clause1) * 5;
        const canopyChamber = Number(clause2) * 10;
        return grandTreeBase + canopyChamber;
      }
    },
    {
      // Cave Waterfall
      id: 'm03',
      clauses: [{ type: 'number', min: 0, max: 50, default: 0 }],
      calculation: clause1 => Number(clause1) * 5
    },
    {
      // Rainforest Awakening
      id: 'm04',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 30;
        if (clause2) points += 20;
        return points;
      }
    },
    {
      // Central Haven
      id: 'm05',
      clauses: [
        { type: 'number', min: 0, max: 40, default: 0 },
        { type: 'number', min: 0, max: 40, default: 0 }
      ],
      calculation: (clause1, clause2) => (Number(clause1) + Number(clause2)) * 5
    },
    {
      // Level Up Challenge: Invasive Attack
      id: 'luc',
      clauses: [
        { type: 'enum', options: ['0', '1', '2', '3', '4', '5'], default: '0' },
        { type: 'number', min: 0, max: 12, default: 0 }
      ],
      calculation: (clause1, clause2) => {
        const invasivesAdded = Number(clause1) * 20;
        const inContainment = Number(clause2) * 10;
        return invasivesAdded + inContainment;
      }
    },
    {
      // Penalties
      id: 'pt',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3+'], default: '0' }],
      calculation: clause1 => {
        switch (clause1) {
          case '1':
            return -10;
          case '2':
            return -30;
          case '3+':
            return 0;
          default:
            return 0;
        }
      }
    }
  ],
  validators: [
    missions => {
      if (
        Number(missions['m01'][0]) +
          Number(missions['m01'][1]) +
          Number(missions['m01'][2]) +
          Number(missions['m05'][0]) >
        40
      )
        throw new ScoresheetError('e1');
    },
    missions => {
      if (Number(missions['m02'][0]) + Number(missions['m02'][1]) + Number(missions['m05'][1]) > 40)
        throw new ScoresheetError('e2');
    }
  ],
  finalizeScore: ctx => (ctx.missions['pt']?.[0] === '3+' ? 0 : ctx.total)
};
