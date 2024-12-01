import { ScoresheetSchema, ScoresheetError } from '../../data/scoresheet-types';

const scoresheet: ScoresheetSchema = {
  season: 'REPLAY℠',
  missions: [
    {
      id: 'm00',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 25 : 0)
    },
    {
      id: 'm01',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm02',
      clauses: [{ type: 'enum', options: ['none', 'magenta', 'yellow', 'blue'], default: 'none' }],
      calculation: clause1 =>
        clause1 === 'magenta' ? 10 : clause1 === 'yellow' ? 15 : clause1 === 'blue' ? 20 : 0
    },
    {
      id: 'm03',
      clauses: [
        { type: 'enum', options: ['none', 'one-figure', 'both-figures'], default: 'none' },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1 !== 'none') clause1 === 'one-figure' ? (points += 5) : (points += 20);
        if (clause2) points += 10;
        if (clause3) points += 20;
        if (clause1 === 'none' && (clause2 || clause3)) throw new ScoresheetError('m03-e1');
        if (clause1 === 'one-figure' && clause2 && clause3) throw new ScoresheetError('m03-e2');
        return points;
      }
    },
    {
      id: 'm04',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'number', min: 0, max: 4, default: 0 },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 10;
        points += Number(clause2) * 10;
        if (clause3) points += 15;

        if (Number(clause2) > 0 && !clause1) throw new ScoresheetError('m04-e1');

        return points;
      }
    },
    {
      id: 'm05',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'enum', options: ['none', 'middle', 'top'], default: 'none' }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 15;
        if (clause2 !== 'none') clause2 === 'middle' ? (points += 15) : (points += 25);
        return points;
      }
    },
    {
      id: 'm06',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 15;
        if (clause2) points += 30;
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
        { type: 'boolean', default: false },
        { type: 'number', min: 0, max: 18, default: 0 },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 25;
        points += Number(clause2) * 5;
        if (clause3) points += 10;
        if (Number(clause2) === 0 && (clause1 || clause3)) throw new ScoresheetError('m08-e1');
        if (Number(clause2) === 1 && clause1 && clause3) throw new ScoresheetError('m08-e2');
        return points;
      }
    },
    {
      id: 'm09',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2'], default: '0' }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 15;
        points += Number(clause3) * 5;

        if (Number(clause3) > Number(clause1) + Number(clause2))
          throw new ScoresheetError('m09-e1');

        return points;
      }
    },
    {
      id: 'm10',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 15 : 0)
    },
    {
      id: 'm11',
      clauses: [
        {
          type: 'enum',
          options: ['none', 'gray', 'red', 'orange', 'yellow', 'light-green', 'dark-green'],
          default: 'none'
        }
      ],
      calculation: clause1 => {
        switch (String(clause1)) {
          case 'gray':
            return 5;
          case 'red':
            return 10;
          case 'orange':
            return 15;
          case 'yellow':
            return 20;
          case 'light-green':
            return 25;
          case 'dark-green':
            return 30;
          default:
            return 0;
        }
      }
    },
    {
      id: 'm12',
      clauses: [
        { type: 'enum', options: ['none', 'outside-large', 'inside-small'], default: 'none' }
      ],
      calculation: clause1 =>
        clause1 === 'outside-large' ? 15 : clause1 === 'inside-small' ? 30 : 0
    },
    {
      id: 'm13',
      clauses: [{ type: 'enum', options: ['none', 'blue', 'magenta', 'yellow'], default: 'none' }],
      calculation: clause1 => {
        switch (String(clause1)) {
          case 'blue':
            return 10;
          case 'magenta':
            return 15;
          case 'yellow':
            return 20;
          default:
            return 0;
        }
      }
    },
    {
      id: 'm14',
      clauses: [
        { type: 'number', min: 0, max: 8, default: 0 },
        { type: 'number', min: 0, max: 4, default: 0 }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        points += Number(clause1) * 5;
        points += Number(clause2) * 10;

        if (Number(clause1) + Number(clause2) > 8) throw new ScoresheetError('m14-e1');

        return points;
      }
    },
    {
      id: 'm15',
      clauses: [{ type: 'number', min: 0, max: 6, default: 6 }],
      calculation: clause1 => {
        switch (Number(clause1)) {
          case 1:
            return 5;
          case 2:
            return 10;
          case 3:
            return 20;
          case 4:
            return 30;
          case 5:
            return 45;
          default:
            return 60;
        }
      }
    }
  ],
  validators: [
    missions => {
      if (missions['m06'][1] && missions['m07'][0]) throw new ScoresheetError('e1');
    },
    missions => {
      if (Number(missions['m04'][1]) + Number(missions['m05'][0]) + Number(missions['m08'][1]) > 18)
        throw new ScoresheetError('e2');
    }
  ]
};
