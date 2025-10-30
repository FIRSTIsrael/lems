import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.string(),
  number: z.string(),
  name: z.string(),
  arrived: z.boolean()
});

export const DivisionSchema = z.object({
  division: z.object({
    teams: z.array(TeamSchema)
  })
});

export const TeamArrivalUpdateSchema = z.object({
  teamArrivalUpdated: z.object({
    teamId: z.string(),
    divisionId: z.string(),
    arrived: z.boolean(),
    updatedAt: z.string()
  })
});

export const UpdateTeamArrivalResponseSchema = z.object({
  updateTeamArrival: z.object({
    teamId: z.string(),
    divisionId: z.string(),
    arrived: z.boolean(),
    updatedAt: z.string()
  })
});

export type Team = z.infer<typeof TeamSchema>;
export type DivisionData = z.infer<typeof DivisionSchema>;
export type TeamArrivalUpdate = z.infer<typeof TeamArrivalUpdateSchema>;
export type UpdateTeamArrivalResponse = z.infer<typeof UpdateTeamArrivalResponseSchema>;
