import { ensureArray } from '../utils/arrays';
import { ScoresheetSchema, ScoresheetError } from './types';

export const scoresheet: ScoresheetSchema = {
  _version: '2025-11-23',
  missions: [
    {
      id: 'eib',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },
    {
      id: 'm01',
      clauses: [
        { type: 'enum', options: ['0', '1', '2'], default: '0' },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        points += Number(clause1) * 10;
        if (clause2) points += 10;
        return points;
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
          return 40;
        }
        return clause1 ? 30 : 0;
      }
    },
    {
      id: 'm04',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: true }
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
      id: 'm05',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0),
      noEquipment: true
    },
    {
      id: 'm06',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3'], default: '0' }],
      calculation: clause1 => Number(clause1) * 10
    },
    {
      id: 'm07',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 30 : 0)
    },
    {
      id: 'm08',
      clauses: [
        {
          type: 'enum',
          options: ['0', '1', '2', '3'],
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
        let points = 0;
        if (clause1) points += 20;
        if (clause2) points += 10;
        return points;
      },
      noEquipment: true
    },
    {
      id: 'm10',
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
      id: 'm11',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        if (clause2) {
          if (!clause1) throw new ScoresheetError('m11-e1');
          return 30;
        }
        return clause1 ? 20 : 0;
      },
      noEquipment: true
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
      calculation: clause1 => (clause1 ? 30 : 0),
      noEquipment: true
    },
    {
      id: 'm14',
      clauses: [
        {
          type: 'enum',
          options: [
            'none',
            'brush',
            'minecart',
            'scale-pan',
            'topsoil',
            'ore-with-fossilized-artifact',
            'precious-artifact',
            'millstone'
          ],
          default: 'none',
          multiSelect: true
        }
      ],
      calculation: clause1 => {
        const _clause1 = ensureArray(clause1);
        if (_clause1.includes('none')) {
          if (_clause1.length > 1) throw new ScoresheetError('m14-e1');
          return 0;
        }
        return _clause1.length * 5;
      },
      noEquipment: true
    },
    {
      id: 'm15',
      clauses: [{ type: 'enum', options: ['0', '1', '2', '3'], default: '0' }],
      calculation: clause1 => {
        return Number(clause1) * 10;
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
      const brushInForum = ensureArray(missions['m14'][0]).includes('brush');
      if (brushInForum && missions['m01'][1] === false) throw new ScoresheetError('e1');
    },
    missions => {
      const scalePanInForum = ensureArray(missions['m14'][0]).includes('scale-pan');
      if (scalePanInForum && missions['m10'][1] === false) throw new ScoresheetError('e3');
    },
    missions => {
      const oreInForum = ensureArray(missions['m14'][0]).includes('ore-with-fossilized-artifact');
      if (oreInForum && Number(missions['m06'][0]) === 0) throw new ScoresheetError('e4');
    },
    missions => {
      const millstoneInForum = ensureArray(missions['m14'][0]).includes('millstone');
      if (millstoneInForum && missions['m07'][0] === false) throw new ScoresheetError('e5');
    },
    missions => {
      const preciousArtifactInForum = ensureArray(missions['m14'][0]).includes('precious-artifact');
      if (preciousArtifactInForum && missions['m04'][0] === false) throw new ScoresheetError('e6');
    }
  ]
};
