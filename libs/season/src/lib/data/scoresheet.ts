import { ScoresheetSchema, ScoresheetError } from './scoresheet-types';

export const scoresheet: ScoresheetSchema = {
  season: 'MASTERPIECE℠',
  missions: [
    {
      id: 'eib',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm01',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm02',
      clauses: [
        { type: 'enum', options: ['none', 'blue', 'pink', 'orange'], default: 'none' },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (clause1 === 'none') throw new ScoresheetError('m02-e1');
          return clause1 === 'blue' ? 30 : clause1 === 'pink' ? 50 : 40;
        }
        return clause1 === 'blue' ? 10 : clause1 === 'pink' ? 20 : clause1 === 'orange' ? 30 : 0;
      }
    },
    {
      id: 'm03',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
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
          return 30;
        }
        return clause1 ? 10 : 0;
      }
    },
    {
      id: 'm05',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm06',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        return points;
      }
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
          options: ['none', 'dark-blue', 'medium-blue', 'light-blue'],
          default: 'none'
        }
      ],
      calculation: clause1 => {
        switch (String(clause1)) {
          case 'dark-blue':
            return 10;
          case 'medium-blue':
            return 20;
          case 'light-blue':
            return 30;
          default:
            return 0;
        }
      }
    },
    {
      id: 'm09',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        return points;
      }
    },
    {
      id: 'm10',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3'], default: '0' }],
      calculation: clause1 => Number(clause1) * 10
    },
    {
      id: 'm11',
      clauses: [
        {
          type: 'enum',
          options: ['none', 'yellow', 'green', 'blue'],
          default: 'none'
        }
      ],
      calculation: clause1 => {
        switch (String(clause1)) {
          case 'yellow':
            return 10;
          case 'green':
            return 20;
          case 'blue':
            return 30;
          default:
            return 0;
        }
      }
    },
    {
      id: 'm12',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m12-e1');
          return 30;
        }
        return clause1 ? 10 : 0;
      }
    },
    {
      id: 'm13',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 20;
        return points;
      }
    },
    {
      id: 'm14',
      clauses: [
        { type: 'enum', options: ['0', '1', '2', '3', '4', '5', '6', '7'], default: '0' },
        { type: 'enum', options: ['0', '1', '2', '3', '4', '5', '6', '7'], default: '0' }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        points += Number(clause1) * 5;
        points += Number(clause2) * 5;

        if (Number(clause2) > Number(clause1)) throw new ScoresheetError('m14-e1');
        if (Number(clause1) > 0 && Number(clause2) === 0) throw new ScoresheetError('m14-e2');

        return points;
      }
    },
    {
      id: 'm15',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3', '4', '5'], default: '0' }],
      calculation: clause1 => Number(clause1) * 10
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
  validators: []
};
