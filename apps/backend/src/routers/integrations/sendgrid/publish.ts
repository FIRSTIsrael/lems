import { parse } from 'csv-parse/sync';
import db from '../../../lib/database';
import { sendEmailWithSendGrid } from './sendgrid-lib';
import { generatePlaceholderPDF } from './placeholder-generator';
import { CSVRecord } from './types';

export interface SendGridPublishOptions {
  eventId: string;
  settings: Record<string, unknown>;
}

export async function publishEventResults(options: SendGridPublishOptions) {
  const { eventId, settings } = options;

  if (!settings) {
    throw new Error('Missing integration settings');
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const { templateId, fromAddress, emailContactsData } = settings;
  if (!templateId || !fromAddress) {
    throw new Error('SendGrid integration missing required settings');
  }

  if (!emailContactsData) {
    throw new Error('No email contacts configured for event');
  }

  // Decode base64 CSV data
  const csvContent = Buffer.from(emailContactsData as string, 'base64').toString('utf-8');
  const contacts = parse(csvContent, {
    columns: ['team_number', 'region', 'recipient_name', 'recipient_email'],
    skip_empty_lines: true,
    from_line: 2 // Skip header row
  });

  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new Error('No email contacts in CSV data');
  }

  const event = await db.events.byId(eventId).get();
  const pdfBuffer = await generatePlaceholderPDF();
  const pdfBase64 = pdfBuffer.toString('base64');

  const failedEmails: string[] = [];

  // Send emails to each contact
  for (const contact of contacts) {
    try {
      const typedContact = contact as CSVRecord;
      const teamNumber = parseInt(typedContact.team_number, 10);
      await sendEmailWithSendGrid({
        apiKey,
        from: fromAddress as string,
        to: typedContact.recipient_email?.toString().trim() || '',
        toName: typedContact.recipient_name?.toString().trim(),
        templateId: templateId as string,
        dynamicTemplateData: {
          eventName: event?.name || 'Event',
          teamNumber,
          recipientName: typedContact.recipient_name,
          region: typedContact.region
        },
        attachments: [
          {
            filename: `team-${teamNumber}-scoresheet.pdf`,
            content: pdfBase64,
            type: 'application/pdf'
          },
          {
            filename: `team-${teamNumber}-rubric.pdf`,
            content: pdfBase64,
            type: 'application/pdf'
          }
        ]
      });
    } catch (error) {
      const typedContact = contact as CSVRecord;
      const email = typedContact.recipient_email;
      failedEmails.push(email);
      console.error(`Failed to send email to ${email}:`, error);
    }
  }

  return {
    success: true,
    total: contacts.length,
    failed: failedEmails.length,
    failedEmails: failedEmails.length > 0 ? failedEmails : undefined
  };
}
