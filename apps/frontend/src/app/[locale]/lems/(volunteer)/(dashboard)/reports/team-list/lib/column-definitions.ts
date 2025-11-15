import { SortField } from './sorting';

export interface ColumnDefinition {
  id: SortField;
  labelKey: string;
  sortable: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    id: 'number',
    labelKey: 'columns.number',
    sortable: true,
    align: 'center',
    minWidth: 80
  },
  {
    id: 'name',
    labelKey: 'columns.name',
    sortable: true,
    align: 'left',
    minWidth: 150
  },
  {
    id: 'affiliation',
    labelKey: 'columns.affiliation',
    sortable: true,
    align: 'left',
    minWidth: 150
  },
  {
    id: 'city',
    labelKey: 'columns.city',
    sortable: true,
    align: 'left',
    minWidth: 120
  },
  {
    id: 'region',
    labelKey: 'columns.region',
    sortable: true,
    align: 'center',
    minWidth: 120
  },
  {
    id: 'arrived',
    labelKey: 'columns.arrived',
    sortable: true,
    align: 'center',
    minWidth: 120
  }
];
