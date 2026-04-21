import { parse } from 'csv-parse/sync';
import { Event } from '@lems/database';
import db from '../../../lib/database';
import { getLemsWebpageAsPdf } from '../export';
import { sendEmailWithSendGrid } from './sendgrid-lib';
import { CSVRecord } from './types';

export interface SendGridPublishOptions {
  eventId: string;
  settings: Record<string, unknown>;
  onProgress?: (percent: number, message?: string) => void;
}

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.warn('SendGrid API key not configured. Emails will not be sent.');
}

const sendEmailToContact = async (
  event: Event,
  contact: CSVRecord,
  emailOptions: { templateId: string; fromAddress: string; language: string }
) => {
  if (!apiKey) {
    console.warn('SendGrid API key not configured. Skipping email sending.');
    return { success: false, email: contact.recipient_email };
  }

  const { templateId, fromAddress, language } = emailOptions;

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

    const [scoresheetPdf, rubricPdf] = await Promise.all([
      getLemsWebpageAsPdf(`/${language}/lems/export/${teamSlug}/${event.slug}/scoresheets`, {
        teamSlug,
        divsionId: divisionId
      }),
      getLemsWebpageAsPdf(`/${language}/lems/export/${teamSlug}/${event.slug}/rubrics`, {
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
  const { eventId, settings, onProgress } = options;

  if (!settings) {
    throw new Error('Missing integration settings');
  }

  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const { templateId, fromAddress, emailContactsData, language = 'en' } = settings;
  if (!templateId || !fromAddress) {
    throw new Error('SendGrid integration missing required settings');
  }

  if (!emailContactsData) {
    throw new Error('No email contacts configured for event');
  }

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

  const results = [];
  let emailCount = 0;

  for (const contact of contacts as CSVRecord[]) {
    emailCount++;
    const percent = Math.round((emailCount / contacts.length) * 100);
    const message = `Sending email ${emailCount}/${contacts.length}...`;
    console.info(message);
    onProgress?.(percent, message);

    const result = await sendEmailToContact(event, contact as CSVRecord, {
      templateId: String(templateId),
      fromAddress: String(fromAddress),
      language: String(language)
    });

    results.push(result);

    if (!result.success) {
      console.warn(`✗ Failed to send email to ${contact.recipient_email}`);
    }
  }

  const failedEmails = results.filter(r => !r.success).map(r => r.email);

  return {
    success: true,
    total: contacts.length,
    failed: failedEmails.length,
    failedEmails: failedEmails.length > 0 ? failedEmails : undefined
  };
}
