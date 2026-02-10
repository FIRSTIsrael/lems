import { Router } from 'express';
import { UpdateablePitMapArea } from '@lems/database';
import { distributeTeamsAcrossPitAreas, validatePitMapCapacity } from '@lems/shared';
import {
  CreatePitMapRequestSchema,
  CreatePitMapAreaRequestSchema,
  UpdatePitMapAreaRequestSchema,
  GenerateAssignmentsRequestSchema,
  PitMapWithAssignmentsResponseSchema,
  PitMapValidationResponseSchema
} from '@lems/types/api/admin';
import db from '../../lib/database';

const router = Router();

// Get pit map for a division
router.get('/divisions/:divisionId', async (req, res) => {
  try {
    const { divisionId } = req.params;

    const pitMap = await db.pitMaps.getPitMapByDivisionId(divisionId);

    if (!pitMap) {
      return res.status(404).json({ error: 'Pit map not found for this division' });
    }

    const areas = await db.pitMaps.getPitMapAreasByPitMapId(pitMap.id);
    const assignments = await db.pitMaps.getTeamsWithPitAssignmentsByDivisionId(divisionId);

    const response = {
      pitMap: {
        id: pitMap.id,
        divisionId: pitMap.division_id,
        mapImageUrl: pitMap.map_image_url,
        areas: areas.map(area => ({
          id: area.id,
          name: area.name,
          coordinates: area.coordinates,
          maxTeams: area.max_teams,
          divisionId: area.division_id
        })),
        createdAt: pitMap.created_at.toISOString(),
        updatedAt: pitMap.updated_at.toISOString()
      },
      assignments: assignments.map(a => ({
        teamId: a.team_id,
        teamNumber: a.team_number,
        teamName: a.team_name,
        teamAffiliation: a.team_affiliation,
        areaId: a.area_id,
        areaName: a.area_name,
        positionX: a.position_x,
        positionY: a.position_y,
        spotNumber: a.spot_number
      })),
      totalTeams: assignments.length,
      totalCapacity: areas.reduce((sum, area) => sum + area.max_teams, 0)
    };

    return res.json(PitMapWithAssignmentsResponseSchema.parse(response));
  } catch (error) {
    console.error('Error fetching pit map:', error);
    return res.status(500).json({ error: 'Failed to fetch pit map' });
  }
});

// Create a new pit map
router.post('/', async (req, res) => {
  try {
    const data = CreatePitMapRequestSchema.parse(req.body);

    // Check if pit map already exists for this division
    const existing = await db.pitMaps.getPitMapByDivisionId(data.divisionId);
    if (existing) {
      return res.status(400).json({ error: 'Pit map already exists for this division' });
    }

    const pitMap = await db.pitMaps.createPitMap({
      division_id: data.divisionId,
      map_image_url: data.mapImageUrl
    });

    return res.status(201).json({
      id: pitMap.id,
      divisionId: pitMap.division_id,
      mapImageUrl: pitMap.map_image_url,
      areas: [],
      createdAt: pitMap.created_at.toISOString(),
      updatedAt: pitMap.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Error creating pit map:', error);
    return res.status(500).json({ error: 'Failed to create pit map' });
  }
});

// Update pit map image
router.patch('/:pitMapId', async (req, res) => {
  try {
    const { pitMapId } = req.params;
    const { mapImageUrl } = req.body;

    if (!mapImageUrl) {
      return res.status(400).json({ error: 'mapImageUrl is required' });
    }

    const pitMap = await db.pitMaps.updatePitMap(pitMapId, {
      map_image_url: mapImageUrl
    });

    return res.json({
      id: pitMap.id,
      divisionId: pitMap.division_id,
      mapImageUrl: pitMap.map_image_url,
      updatedAt: pitMap.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Error updating pit map:', error);
    return res.status(500).json({ error: 'Failed to update pit map' });
  }
});

// Delete pit map
router.delete('/:pitMapId', async (req, res) => {
  try {
    const { pitMapId } = req.params;

    // Delete all assignments and areas first
    await db.pitMaps.deletePitMapAssignmentsByPitMapId(pitMapId);
    await db.pitMaps.deletePitMapAreasByPitMapId(pitMapId);
    await db.pitMaps.deletePitMap(pitMapId);

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting pit map:', error);
    return res.status(500).json({ error: 'Failed to delete pit map' });
  }
});

// Create a pit map area
router.post('/areas', async (req, res) => {
  try {
    const data = CreatePitMapAreaRequestSchema.parse(req.body);

    const area = await db.pitMaps.createPitMapArea({
      pit_map_id: data.pitMapId,
      name: data.name,
      coordinates: data.coordinates,
      max_teams: data.maxTeams,
      division_id: data.divisionId || null
    });

    return res.status(201).json({
      id: area.id,
      name: area.name,
      coordinates: area.coordinates,
      maxTeams: area.max_teams,
      divisionId: area.division_id
    });
  } catch (error) {
    console.error('Error creating pit map area:', error);
    return res.status(500).json({ error: 'Failed to create pit map area' });
  }
});

// Update a pit map area
router.patch('/areas/:areaId', async (req, res) => {
  try {
    const { areaId } = req.params;
    const data = UpdatePitMapAreaRequestSchema.parse(req.body);

    const updateData: Partial<UpdateablePitMapArea> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    if (data.maxTeams !== undefined) updateData.max_teams = data.maxTeams;
    if (data.divisionId !== undefined) updateData.division_id = data.divisionId;

    const area = await db.pitMaps.updatePitMapArea(areaId, updateData);

    return res.json({
      id: area.id,
      name: area.name,
      coordinates: area.coordinates,
      maxTeams: area.max_teams,
      divisionId: area.division_id
    });
  } catch (error) {
    console.error('Error updating pit map area:', error);
    return res.status(500).json({ error: 'Failed to update pit map area' });
  }
});

// Delete a pit map area
router.delete('/areas/:areaId', async (req, res) => {
  try {
    const { areaId } = req.params;

    // Delete all assignments for this area first
    await db.pitMaps.deletePitMapAssignmentsByAreaId(areaId);
    await db.pitMaps.deletePitMapArea(areaId);

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting pit map area:', error);
    return res.status(500).json({ error: 'Failed to delete pit map area' });
  }
});

// Generate automatic team assignments
router.post('/generate-assignments', async (req, res) => {
  try {
    const data = GenerateAssignmentsRequestSchema.parse(req.body);
    const { pitMapId } = data;

    // Get pit map and areas
    const pitMap = await db.raw.sql
      .selectFrom('pit_maps')
      .selectAll()
      .where('id', '=', pitMapId)
      .executeTakeFirst();

    if (!pitMap) {
      return res.status(404).json({ error: 'Pit map not found' });
    }

    const areas = await db.pitMaps.getPitMapAreasByPitMapId(pitMapId);

    if (areas.length === 0) {
      return res.status(400).json({ error: 'No areas defined for this pit map' });
    }

    // Get all teams in the division
    const teams = await db.raw.sql
      .selectFrom('team_divisions as td')
      .innerJoin('teams as t', 't.id', 'td.team_id')
      .select(['t.id', 't.number', 't.name', 't.affiliation', 'td.division_id'])
      .where('td.division_id', '=', pitMap.division_id)
      .execute();

    if (teams.length === 0) {
      return res.status(400).json({ error: 'No teams found in this division' });
    }

    // Validate capacity
    const validation = validatePitMapCapacity(
      teams.map(t => ({
        id: t.id,
        number: t.number,
        name: t.name,
        affiliation: t.affiliation,
        division_id: t.division_id
      })),
      areas.map(a => ({
        id: a.id,
        name: a.name,
        max_teams: a.max_teams,
        division_id: a.division_id
      }))
    );

    if (!validation.valid) {
      return res.status(400).json(PitMapValidationResponseSchema.parse(validation));
    }

    // Delete existing assignments
    await db.pitMaps.deletePitMapAssignmentsByPitMapId(pitMapId);

    // Generate new assignments
    const assignments = distributeTeamsAcrossPitAreas(
      teams.map(t => ({
        id: t.id,
        number: t.number,
        name: t.name,
        affiliation: t.affiliation,
        division_id: t.division_id
      })),
      areas.map(a => ({
        id: a.id,
        name: a.name,
        max_teams: a.max_teams,
        division_id: a.division_id
      }))
    );

    // Save assignments to database
    if (assignments.length > 0) {
      await db.pitMaps.createPitMapAssignments(
        assignments.map(a => ({
          pit_map_area_id: a.pit_map_area_id,
          team_id: a.team_id,
          position_x: a.position_x,
          position_y: a.position_y,
          spot_number: a.spot_number
        }))
      );
    }

    // Fetch the complete result
    const teamAssignments = await db.pitMaps.getTeamsWithPitAssignmentsByDivisionId(
      pitMap.division_id
    );

    return res.json({
      success: true,
      assignmentsCreated: assignments.length,
      assignments: teamAssignments.map(a => ({
        teamId: a.team_id,
        teamNumber: a.team_number,
        teamName: a.team_name,
        teamAffiliation: a.team_affiliation,
        areaId: a.area_id,
        areaName: a.area_name,
        positionX: a.position_x,
        positionY: a.position_y,
        spotNumber: a.spot_number
      }))
    });
  } catch (error) {
    console.error('Error generating assignments:', error);
    return res.status(500).json({ error: 'Failed to generate assignments' });
  }
});

export default router;
