import sgMail from '@sendgrid/mail';

interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  type: string;
}

interface SendEmailParams {
  apiKey: string;
  from: string;
  to: string;
  toName?: string;
  templateId: string;
  dynamicTemplateData: Record<string, unknown>;
  attachments?: EmailAttachment[];
}

export async function sendEmailWithSendGrid(params: SendEmailParams): Promise<void> {
  sgMail.setApiKey(params.apiKey);

  const mail = {
    to: {
      email: params.to,
      name: params.toName
    },
    from: params.from,
    templateId: params.templateId,
    dynamicTemplateData: params.dynamicTemplateData,
    attachments: params.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      type: att.type,
      disposition: 'attachment' as const
    }))
  };

  try {
    await sgMail.send(mail);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send email to ${params.to}: ${error.message}`);
    }
    throw error;
  }
}
