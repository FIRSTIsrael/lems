import { z } from 'zod';

export const AdminRobotGameTableResponseSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type RobotGameTable = z.infer<typeof AdminRobotGameTableResponseSchema>;

export const AdminRobotGameTablesResponseSchema = z.array(AdminRobotGameTableResponseSchema);
