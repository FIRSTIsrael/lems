export * from './types';

export { GET_PRACTICE_TABLES_CONFIG, GET_PRACTICE_TABLE_ASSIGNMENTS } from './query';

export { UPDATE_PRACTICE_TABLE_ASSIGNMENT } from './mutations';

export {
  PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION,
  createPracticeTableAssignmentsSubscription
} from './subscriptions';
