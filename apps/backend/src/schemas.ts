// Re-export schemas for frontend consumption
// This file exposes only the schemas (not the implementation details)

export { AdminSeasonResponseSchema } from './routers/admin/seasons/types';
export type { AdminSeasonResponse } from './routers/admin/seasons/types';

export { AdminSeasonsResponseSchema } from './routers/admin/seasons/types';
export type { AdminSeasonsResponse } from './routers/admin/seasons/types';

export { AdminUserResponseSchema } from './routers/admin/users/types';
export type { AdminUserResponse } from './routers/admin/users/types';

export { AdminUserPermissionsResponseSchema } from './routers/admin/users/types';
export type { AdminUserPermissionsResponse } from './routers/admin/users/types';

// You can add more schema exports here as needed
// export { AdminUserResponseSchema } from './routers/admin/users/types';
// export type { AdminUserResponse } from './routers/admin/users/types';
