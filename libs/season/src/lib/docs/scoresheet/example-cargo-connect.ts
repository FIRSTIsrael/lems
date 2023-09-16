import { Scoresheet, ScoresheetError } from '../../data/scoresheet-types';

const scoresheet: Scoresheet = {
  season: 'CARGO CONNECT℠',
  missions: [
    {
      id: 'm00',
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
      clauses: [{ type: 'enum', options: ['none', 'partly', 'completely'], default: 'none' }],
      calculation: clause1 => (clause1 === 'partly' ? 20 : clause1 === 'completely' ? 30 : 0)
    },
    {
      id: 'm03',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
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
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        if (clause1 && clause2) points += 10;
        return points;
      }
    },
    {
      id: 'm05',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm06',
      clauses: [
        { type: 'enum', options: ['none', 'not-knocked', 'knocked'], default: 'not-knocked' },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) return 0;
        return clause1 === 'partly' ? 20 : clause1 === 'completely' ? 30 : 0;
      }
    },
    {
      id: 'm07',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
        if (clause2 && !clause1) throw new ScoresheetError('m07-e1'); // Container passed but still touching?
        return points;
      }
    },
    {
      id: 'm08',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
        if (clause3) points += 10;
        if (clause3 && !clause1) throw new ScoresheetError('m08-e1'); // Both separated but team's is not?
        return points;
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
        if (clause1) points += 20;
        if (clause2) points += 20;
        return points;
      }
    },
    {
      id: 'm10',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm11',
      clauses: [{ type: 'enum', options: ['none', 'partly', 'completely'], default: 'none' }],
      calculation: clause1 => (clause1 === 'partly' ? 20 : clause1 === 'completely' ? 30 : 0)
    },
    {
      id: 'm12',
      clauses: [
        { type: 'enum', options: ['none', 'mat', 'nothing'], default: 'none' },
        { type: 'enum', options: ['none', 'partly', 'completely'], default: 'completely' }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1 !== 'none') clause1 === 'mat' ? (points += 20) : (points += 30);
        if (clause2 !== 'none') clause2 === 'partly' ? (points += 5) : (points += 10);
        return points;
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
        if (clause2) points += 10;
        if (clause1 && clause2) points += 10;
        return points;
      }
    },
    {
      id: 'm14',
      clauses: [{ type: 'enum', options: ['0', '1', '2'], default: '0' }],
      calculation: clause1 => parseInt(String(clause1)) * 10
    },
    {
      id: 'm15',
      clauses: [
        { type: 'number', min: 0, max: 2, default: 0 },
        { type: 'number', min: 0, max: 2, default: 0 },
        { type: 'number', min: 0, max: 2, default: 0 }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        points += Number(clause1) * 10;
        points += Number(clause2) * 20;
        points += Number(clause3) * 30;
        return points;
      }
    },
    {
      id: 'm16',
      clauses: [
        { type: 'number', min: 0, max: 8, default: 0 },
        { type: 'number', min: 0, max: 8, default: 0 },
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'number', min: 0, max: 6, default: 0 }
      ],
      calculation: (clause1, clause2, clause3, clause4, clause5) => {
        let points = 0;
        points += Number(clause1) * 5;
        points += Number(clause2) * 10;
        if (clause3) points += 20;
        if (clause4) points += 20;
        points += Number(clause5) * 10;

        if (Number(clause1) + Number(clause2) > 8) throw new ScoresheetError('m16-e1'); // Too many container
        if (Number(clause5) > Number(clause2)) throw new ScoresheetError('m16-e2'); // Circles with containers > containes in circles
        if (Number(clause3) + Number(clause4) > Number(clause2))
          // Blue / Green in circle but not reflected in clause 2
          throw new ScoresheetError('m16-e3');
        if (Number(clause3) + Number(clause4) > Number(clause5))
          // Blue / Green in circle but not reflectedd in circle count
          throw new ScoresheetError('m16-e4');

        return points;
      }
    },
    {
      id: 'm17',
      clauses: [{ type: 'number', min: 0, max: 6, default: 6 }],
      calculation: clause1 => {
        switch (Number(clause1)) {
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
    values => {
      // Cargo containers cannot be in circles no matter what
      const m15 = values.find(m => m.id === 'm15');
      const m16 = values.find(m => m.id === 'm16');
      if (m15 && m16) {
        if (Number(m15.values[2]) + Number(m16.values[0]) + Number(m16.values[1]) > 8)
          throw new ScoresheetError('e1');
      }
    }
  ]
};
