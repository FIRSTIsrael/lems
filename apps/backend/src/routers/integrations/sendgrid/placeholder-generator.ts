import puppeteer, { Browser } from 'puppeteer';

/**
 * Generates a placeholder PDF document using Puppeteer. The PDF is formatted as an A4 page with basic content.
 * @returns A base64-encoded string of the generated PDF document
 */
export async function generatePlaceholderPDF(): Promise<string> {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
              color: #000;
            }
            .page {
              width: 100%;
              min-height: 100vh;
              background: white;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              font-size: 12px;
              line-height: 1.6;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <h1>Event Results</h1>
            <p>This is a placeholder document generated for event results distribution.</p>
            <p>Generated: ${new Date().toISOString()}</p>
          </div>
        </body>
      </html>
    `,
      {
        waitUntil: 'networkidle0'
      }
    );

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    });

    if (!pdf || pdf.length === 0) {
      throw new Error('PDF generation resulted in empty buffer');
    }

    const base64String = Buffer.from(pdf).toString('base64');
    return base64String;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
