import express from 'express';
import { parse } from 'csv-parse/sync';
import { AdminEventRequest } from '../../../types/express';
import { requirePermission } from '../../../routers/admin/middleware/require-permission';
import { attachEvent } from '../../../routers/admin/middleware/attach-event';
import { authMiddleware as adminAuth } from '../../../routers/admin/middleware/auth';
import db from '../../../lib/database';
import { sendEmailWithSendGrid } from './sendgrid-lib';
import { generatePlaceholderPDF } from './placeholder-generator';
import { CSVRecord } from './types';

const router = express.Router({ mergeParams: true });

router.use(
  '/:eventId',
  adminAuth, // This integration is managed from the admin panel, by admin users.
  attachEvent(),
  requirePermission('MANAGE_EVENT_DETAILS')
);

router.post('/:eventId/upload-contacts', async (req: AdminEventRequest, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) {
      res.status(400).json({ error: 'No CSV content provided' });
      return;
    }

    const csvText =
      typeof csvContent === 'string' ? csvContent : Buffer.from(csvContent).toString('utf-8');

    const records = parse(csvText, {
      columns: ['team_number', 'region', 'recipient_email'],
      skip_empty_lines: true,
      from_line: 2 // Skip header row
    }) as CSVRecord[];

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'CSV file is empty or invalid' });
      return;
    }

    // Validate email format
    const validRecords = records.filter((record: CSVRecord) => {
      const email = record.recipient_email?.toString().trim();
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });

    if (validRecords.length === 0) {
      res.status(400).json({ error: 'No valid email addresses found in CSV' });
      return;
    }

    // Get current integration and update with base64-encoded CSV data
    const eventId = (req as AdminEventRequest).eventId;
    const integration = await db.integrations.byType(eventId, 'sendgrid').get();
    if (!integration) {
      res.status(404).json({ error: 'SendGrid integration not found' });
      return;
    }

    // Encode CSV content to base64
    const emailContactsData = Buffer.from(csvContent).toString('base64');

    // Update integration settings with encoded data
    const updatedSettings = {
      ...integration.settings,
      emailContactsData
    };

    await db.integrations.byId(integration.pk.toString()).update({ settings: updatedSettings });

    res.json({ count: validRecords.length });
  } catch (error) {
    console.error('Error uploading contacts:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

router.post('/:eventId/send-test', async (req: AdminEventRequest, res) => {
  try {
    const { templateId, fromAddress, testEmailAddress } = req.body;

    if (!templateId || !fromAddress || !testEmailAddress) {
      res.status(400).json({ error: 'Missing required settings' });
      return;
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'SendGrid API key not configured' });
      return;
    }

    const pdfBase64 = await generatePlaceholderPDF();

    await sendEmailWithSendGrid({
      apiKey,
      from: fromAddress,
      to: testEmailAddress,
      templateId,
      dynamicTemplateData: {
        eventName: 'Test Event',
        teamNumber: 0
      },
      attachments: [
        {
          filename: 'scoresheet.pdf',
          content: pdfBase64,
          type: 'application/pdf'
        },
        {
          filename: 'rubric.pdf',
          content: pdfBase64,
          type: 'application/pdf'
        }
      ]
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Failed to send test email' });
  }
});

export default router;
