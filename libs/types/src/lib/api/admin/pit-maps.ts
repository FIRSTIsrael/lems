import { z } from 'zod';

// Pit Map Area Schema
export const PitMapAreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  coordinates: z.string(), // JSON string of polygon coordinates
  maxTeams: z.number().int().positive(),
  divisionId: z.string().uuid().nullable()
});

export type PitMapArea = z.infer<typeof PitMapAreaSchema>;

// Pit Map Schema
export const PitMapSchema = z.object({
  id: z.string().uuid(),
  divisionId: z.string().uuid(),
  mapImageUrl: z.string().url(),
  areas: z.array(PitMapAreaSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type PitMap = z.infer<typeof PitMapSchema>;

// Team Assignment Schema
export const TeamAssignmentSchema = z.object({
  teamId: z.string().uuid(),
  teamNumber: z.number().int(),
  teamName: z.string(),
  teamAffiliation: z.string(),
  areaId: z.string().uuid(),
  areaName: z.string(),
  positionX: z.number(),
  positionY: z.number(),
  spotNumber: z.number().int()
});

export type TeamAssignment = z.infer<typeof TeamAssignmentSchema>;

// Create Pit Map Request
export const CreatePitMapRequestSchema = z.object({
  divisionId: z.string().uuid(),
  mapImageUrl: z.string().url()
});

export type CreatePitMapRequest = z.infer<typeof CreatePitMapRequestSchema>;

// Create Pit Map Area Request
export const CreatePitMapAreaRequestSchema = z.object({
  pitMapId: z.string().uuid(),
  name: z.string().min(1).max(100),
  coordinates: z.string(), // JSON string of polygon [{x, y}, ...]
  maxTeams: z.number().int().positive(),
  divisionId: z.string().uuid().nullable().optional()
});

export type CreatePitMapAreaRequest = z.infer<typeof CreatePitMapAreaRequestSchema>;

// Update Pit Map Area Request
export const UpdatePitMapAreaRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  coordinates: z.string().optional(),
  maxTeams: z.number().int().positive().optional(),
  divisionId: z.string().uuid().nullable().optional()
});

export type UpdatePitMapAreaRequest = z.infer<typeof UpdatePitMapAreaRequestSchema>;

// Generate Assignments Request
export const GenerateAssignmentsRequestSchema = z.object({
  pitMapId: z.string().uuid()
});

export type GenerateAssignmentsRequest = z.infer<typeof GenerateAssignmentsRequestSchema>;

// Pit Map with Assignments Response
export const PitMapWithAssignmentsResponseSchema = z.object({
  pitMap: PitMapSchema,
  assignments: z.array(TeamAssignmentSchema),
  totalTeams: z.number().int(),
  totalCapacity: z.number().int()
});

export type PitMapWithAssignmentsResponse = z.infer<typeof PitMapWithAssignmentsResponseSchema>;

// Validation Response
export const PitMapValidationResponseSchema = z.object({
  valid: z.boolean(),
  totalCapacity: z.number().int(),
  totalTeams: z.number().int(),
  message: z.string().optional()
});

export type PitMapValidationResponse = z.infer<typeof PitMapValidationResponseSchema>;
