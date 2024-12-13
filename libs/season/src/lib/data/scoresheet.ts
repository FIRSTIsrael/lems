import { ScoresheetSchema, ScoresheetError } from './scoresheet-types';
import { ensureArray } from '@lems/utils/arrays';

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
      },
      noEquipment: true
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
      },
      noEquipment: true
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
      calculation: clause1 => (clause1 ? 30 : 0),
      noEquipment: true
    },
    {
      id: 'm07',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0),
      noEquipment: true
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
      calculation: clause1 => Number(clause1) * 10,
      noEquipment: true
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
      },
      noEquipment: true
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
      calculation: clause1 => Number(clause1) * 10,
      noEquipment: true
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
            points += 30;
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
        {
          type: 'enum',
          options: [
            'empty',
            'water-sample',
            'plankton-sample',
            'seabed-sample',
            'trident-head',
            'trident-handle',
            'treasure-chest'
          ],
          default: 'empty',
          multiSelect: true
        },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        const _clause1 = ensureArray(clause1);
        if (_clause1.includes('empty')) {
          if (_clause1.length > 1) throw new ScoresheetError('m15-e1');
        } else {
          points += _clause1.length * 5;
        }
        if (clause2) points += 20;
        return points;
      },
      noEquipment: true
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
      const planktonInBoat = ensureArray(missions['m15'][0]).includes('plankton-sample');
      if (planktonInBoat && !missions['m14'][1]) throw new ScoresheetError('e1');
    },
    missions => {
      const seabedInBoat = ensureArray(missions['m15'][0]).includes('seabed-sample');
      if (seabedInBoat && !missions['m14'][2]) throw new ScoresheetError('e2');
    },
    missions => {
      const tridentPartsInBoat = ensureArray(missions['m15'][0]).filter(item =>
        item.includes('trident')
      ).length;
      if (tridentPartsInBoat > Number(missions['m14'][3])) throw new ScoresheetError('e3');
    },
    missions => {
      const treasureChestInBoat = ensureArray(missions['m15'][0]).includes('treasure-chest');
      if (treasureChestInBoat && !missions['m07'][0]) throw new ScoresheetError('e4');
    }
  ]
};
