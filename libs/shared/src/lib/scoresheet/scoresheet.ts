import { ScoresheetSchema, ScoresheetError } from './types';

export const scoresheet: ScoresheetSchema = {
  _version: '2026-08-04',
  missions: [
    {
      id: 'eib',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'pt',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3', '4', '5', '6'], default: '6' }],
      calculation: clause1 => {
        switch (Number(clause1)) {
          case 0:
            return 0;
          case 1:
            return 10;
          case 2:
            return 15;
          case 3:
            return 25;
          case 4:
            return 35;
          default:
            return 50;
        }
      }
    },
    {
      id: 'm01',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m01-e1');
          return 30;
        }
        return clause1 ? 20 : 0;
      },
      noEquipment: true
    },
    {
      id: 'm02',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3'], default: '0' }],
      calculation: clause1 => Number(clause1) * 10
    },
    {
      id: 'm03',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m03-e1');
          return 30;
        }
        return clause1 ? 20 : 0;
      }
    },
    {
      id: 'm04',
      clauses: [
        { type: 'enum', options: ['0', '1', '2'], default: '0' },
        { type: 'boolean', default: true },
        { type: 'boolean', default: true }
      ],
      calculation: (clause1, clause2, clause3) => {
        if (!clause2) {
          if (clause3) throw new ScoresheetError('m04-e1');
          return 0;
        }
        if (clause3 && Number(clause1) === 2) return 30;
        return Number(clause1) === 0 ? 0 : 10;
      },
      noEquipment: true
    },
    {
      id: 'm05',
      clauses: [
        { type: 'enum', options: ['none', 'partially-extended', 'fully-extended'], default: 'none' }
      ],
      calculation: clause1 => {
        switch (clause1) {
          case 'partially-extended':
            return 10;
          case 'fully-extended':
            return 20;
          default:
            return 0;
        }
      },
      noEquipment: true
    },
    {
      id: 'm06',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2', '3', '4'], default: '0' }
      ],
      calculation: (clause1, clause2) => {
        if (Number(clause2) > 0 && !clause1) throw new ScoresheetError('m06-e1');
        return clause1 ? Number(clause2) * 10 : 0;
      }
    },
    {
      id: 'm07',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2'], default: '0' }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        const _clause2 = Number(clause2);
        if (clause1) points += 20;
        if (_clause2 > 0) {
          if (!clause1) throw new ScoresheetError('m07-e1');
          points += _clause2 * 10;
        }
        return points;
      },
      noEquipment: true
    },
    {
      id: 'm08',
      clauses: [
        {
          type: 'boolean',
          default: false
        }
      ],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm09',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        if (clause3) points += 10;
        return points;
      },
      noEquipment: true
    },
    {
      id: 'm10',
      clauses: [
        { type: 'boolean', default: true },
        { type: 'boolean', default: true }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        return points;
      },
      noEquipment: true
    },
    {
      id: 'm11',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm12',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
        return points;
      },
      noEquipment: true
    },
    {
      id: 'm13',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm14',
      clauses: [
        { type: 'enum', options: ['0', '1', '2', '3', '4'], default: '0' },
        { type: 'enum', options: ['0', '1', '2', '3', '4'], default: '0' }
      ],
      calculation: (clause1, clause2) => {
        const _clause1 = Number(clause1);
        const _clause2 = Number(clause2);
        if (_clause2 > _clause1) throw new ScoresheetError('m14-e1');
        return (_clause1 + _clause2) * 5;
      }
    },
    {
      id: 'm15',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'enum', options: ['mine', 'city', 'farm'], default: 'mine' }
      ],
      calculation: (clause1, clause2, clause3, clause4) => {
        let points = 0;
        if (clause1) points += clause4 === 'mine' ? 20 : 10;
        if (clause2) points += clause4 === 'city' ? 20 : 10;
        if (clause3) points += clause4 === 'farm' ? 20 : 10;
        return points;
      },
      noEquipment: true
    }
  ],
  validators: [
    missions => {
      let supply = 2; // Two seeds aren't tracked by missions.
      if (Number(missions['m02'][0]) > 0) supply += 1; // The actual seed isn't tracked by the mission, but any being released will count as an available seed.
      if (missions['m09'][2]) supply += 1;
      if (supply < Number(missions['m14'][0])) throw new ScoresheetError('e1');
    }
  ]
};
