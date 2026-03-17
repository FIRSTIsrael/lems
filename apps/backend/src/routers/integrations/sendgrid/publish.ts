import { parse } from 'csv-parse/sync';
import { Event } from '@lems/database';
import db from '../../../lib/database';
import { getLemsWebpageAsPdf } from '../export';
import { sendEmailWithSendGrid } from './sendgrid-lib';
import { CSVRecord } from './types';

export interface SendGridPublishOptions {
  eventId: string;
  settings: Record<string, unknown>;
}

const apiKey = process.env.SENDGRID_API_KEY;

const sendEmailToContact = async (
  event: Event,
  contact: CSVRecord,
  emailOptions: { templateId: string; fromAddress: string }
) => {
  const { templateId, fromAddress } = emailOptions;

  const teamNumber = parseInt(contact.team_number, 10);
  const region = contact.region?.toString().toUpperCase() || '';
  const email = contact.recipient_email;

  try {
    const teamSlug = `${region}-${teamNumber}`;
    const team = await db.teams.bySlug(teamSlug).get();
    if (!team) {
      throw new Error(`Team not found: ${teamSlug}`);
    }

    const divisionId = await db.teams.bySlug(teamSlug).isInEvent(event.id);
    if (!divisionId) {
      throw new Error(`Team ${teamSlug} is not registered in event ${event.id}`);
    }

    // Generate both PDFs in parallel
    const [scoresheetPdf, rubricPdf] = await Promise.all([
      getLemsWebpageAsPdf(`/lems/export/${teamSlug}/${event.slug}/scoresheets`, {
        teamSlug,
        divsionId: divisionId
      }),
      getLemsWebpageAsPdf(`/lems/export/${teamSlug}/${event.slug}/rubrics`, {
        teamSlug,
        divsionId: divisionId
      })
    ]);

    await sendEmailWithSendGrid({
      apiKey,
      from: fromAddress as string,
      to: email?.toString().trim() || '',
      templateId: templateId as string,
      dynamicTemplateData: {
        eventName: event?.name || 'Event',
        teamNumber,
        region
      },
      attachments: [
        {
          filename: `team-${teamNumber}-scoresheet.pdf`,
          content: scoresheetPdf.toString('base64'),
          type: 'application/pdf'
        },
        {
          filename: `team-${teamNumber}-rubric.pdf`,
          content: rubricPdf.toString('base64'),
          type: 'application/pdf'
        }
      ]
    });

    return { success: true, email };
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    return { success: false, email };
  }
};

export async function publishEventResults(options: SendGridPublishOptions) {
  const { eventId, settings } = options;

  if (!settings) {
    throw new Error('Missing integration settings');
  }

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
    columns: ['team_number', 'region', 'recipient_email'],
    skip_empty_lines: true,
    from_line: 2 // Skip header row
  });

  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new Error('No email contacts in CSV data');
  }

  const event = await db.events.byId(eventId).get();
  if (!event) {
    throw new Error('Event not found');
  }

  const emailPromises = contacts.map(contact =>
    sendEmailToContact(event, contact as CSVRecord, {
      templateId: String(templateId),
      fromAddress: String(fromAddress)
    })
  );

  const results = await Promise.all(emailPromises);
  const failedEmails = results.filter(r => !r.success).map(r => r.email);

  return {
    success: true,
    total: contacts.length,
    failed: failedEmails.length,
    failedEmails: failedEmails.length > 0 ? failedEmails : undefined
  };
}
