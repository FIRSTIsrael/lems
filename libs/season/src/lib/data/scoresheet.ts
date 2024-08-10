import { ScoresheetSchema, ScoresheetError } from './scoresheet-types';

export const scoresheet: ScoresheetSchema = {
  season: 'SUBMERGED℠',
  missions: [
    {
      id: 'eib',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm01',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        if (!clause1 && clause2) throw new ScoresheetError('m01-e1');
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
        if (clause3) points += 20;
        return points;
      }
    },
    {
      id: 'm02',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m02-e1');
          return 30;
        }
        return clause1 ? 20 : 0;
      }
    },
    {
      id: 'm03',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2', '3'], default: '0' }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 20;
        points += Number(clause2) * 5;
        return points;
      }
    },
    {
      id: 'm04',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m04-e1');
          return 40;
        }
        return clause1 ? 20 : 0;
      }
    },
    {
      id: 'm05',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm06',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm07',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm08',
      clauses: [
        {
          type: 'enum',
          options: ['0', '1', '2', '3', '4'],
          default: '0'
        }
      ],
      calculation: clause1 => Number(clause1) * 10
    },
    {
      id: 'm09',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m09-e1');
          return 30;
        }
        return clause1 ? 20 : 0;
      }
    },
    {
      id: 'm10',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 30;
        if (clause2) points += 10;
        return points;
      }
    },
    {
      id: 'm11',
      clauses: [
        {
          type: 'enum',
          options: ['0', '1', '2'],
          default: '0'
        }
      ],
      calculation: clause1 => {
        switch (Number(clause1)) {
          case 0:
            return 0;
          case 1:
            return 20;
          case 2:
            return 30;
          default:
            return 0;
        }
      }
    },
    {
      id: 'm12',
      clauses: [
        {
          type: 'enum',
          options: ['0', '1', '2', '3', '4', '5'],
          default: '0'
        }
      ],
      calculation: clause1 => Number(clause1) * 10
    },
    {
      id: 'm13',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm14',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2'], default: '0' }
      ],
      calculation: (clause1, clause2, clause3, clause4) => {
        let points = 0;
        if (clause1) points += 5;
        if (clause2) points += 10;
        if (clause3) points += 10;

        switch (Number(clause4)) {
          case 0:
            break;
          case 1:
            points += 20;
            break;
          case 2:
            points += 10;
            break;
          default:
            break;
        }

        return points;
      }
    },
    {
      id: 'm15',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2'], default: '0' },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3, clause4, clause5, clause6) => {
        let points = 0;
        if (clause1) points += 5;
        if (clause2) points += 5;
        if (clause3) points += 5;
        points += Number(clause4) * 5;
        if (clause5) points += 5;
        if (clause6) points += 20;
        return points;
      }
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
    }
  ],
  validators: [
    missions => {
      if (missions['m15'][1] && !missions['m14'][1]) throw new ScoresheetError('e1');
    },
    missions => {
      if (missions['m15'][2] && !missions['m14'][2]) throw new ScoresheetError('e2');
    },
    missions => {
      if (Number(missions['m15'][3]) > Number(missions['m14'][3])) throw new ScoresheetError('e3');
    },
    missions => {
      if (missions['m15'][4] && !missions['m07'][0]) throw new ScoresheetError('e4');
    }
  ]
};
