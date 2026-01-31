import express from 'express';
import {
  validateIntegrationSettings,
  getIntegrationConfig,
  IntegrationType
} from '@lems/shared/integrations';
import { AdminEventRequest } from '../../../../types/express';
import { requirePermission } from '../../middleware/require-permission';
import db from '../../../../lib/database';
import { makeAdminIntegrationResponse, validateAndUpdateIntegration } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminEventRequest, res) => {
  try {
    const integrations = await db.integrations.byEventId(req.eventId).getAll();
    res.json(integrations.map(makeAdminIntegrationResponse));
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

router.post('/', requirePermission('MANAGE_EVENT_DETAILS'), async (req: AdminEventRequest, res) => {
  try {
    const { type, settings, enabled } = req.body;

    if (!type) {
      res.status(400).json({ error: 'Integration type is required' });
      return;
    }

    // Validate the integration type exists
    getIntegrationConfig(type);

    const validatedSettings = validateIntegrationSettings(type, settings || {});

    const existing = await db.integrations.byType(req.eventId, type).get();
    if (existing) {
      res
        .status(409)
        .json({ error: `Integration of type "${type}" already exists for this event` });
      return;
    }

    const integration = await db.integrations.create({
      event_id: req.eventId,
      integration_type: type,
      enabled: enabled !== false,
      settings: validatedSettings
    });

    res.status(201).json(makeAdminIntegrationResponse(integration));
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unknown integration type')) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message.includes('validation')) {
      res.status(400).json({ error: `Invalid settings: ${error.message}` });
      return;
    }

    console.error('Error creating integration:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

router.put(
  '/:id',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    try {
      const integration = await db.integrations.byId(req.params.id).get();

      if (!integration) {
        res.status(404).json({ error: 'Integration not found' });
        return;
      }

      if (integration.event_id !== req.eventId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const { enabled, settings } = req.body;
      const updateData: Record<string, unknown> = {};

      if (typeof enabled === 'boolean') {
        updateData.enabled = enabled;
      }

      if (settings) {
        // Validate settings against the integration type's schema
        const validatedSettings = validateAndUpdateIntegration(
          integration.integration_type as IntegrationType,
          integration.settings,
          { settings }
        );
        updateData.settings = validatedSettings;
      }

      const updateDataTyped = updateData as Record<string, unknown>;
      if (Object.keys(updateDataTyped).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const updated = await db.integrations.byId(req.params.id).update(updateDataTyped);
      res.json(makeAdminIntegrationResponse(updated));
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: `Invalid settings: ${error.message}` });
        return;
      }

      console.error('Error updating integration:', error);
      res.status(500).json({ error: 'Failed to update integration' });
    }
  }
);

router.delete(
  '/:id',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    try {
      const integration = await db.integrations.byId(req.params.id).get();

      if (!integration) {
        res.status(404).json({ error: 'Integration not found' });
        return;
      }

      if (integration.event_id !== req.eventId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      await db.integrations.byId(req.params.id).delete();
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting integration:', error);
      res.status(500).json({ error: 'Failed to delete integration' });
    }
  }
);

export default router;
