import puppeteer, { Browser, BrowserContext, Page, PDFOptions } from 'puppeteer';
import jwt from 'jsonwebtoken';

class BrowserManager {
  private static instance: Browser | null = null;
  private static activePages: Set<Page> = new Set();
  private static activeContexts: Set<BrowserContext> = new Set();
  private static isShuttingDown = false;
  private static initializationPromise: Promise<Browser> | null = null;
  private static pageTimeouts: Map<Page, NodeJS.Timeout> = new Map();
  private static readonly MAX_PAGES = 25;
  private static readonly PAGE_TIMEOUT = 5 * 60 * 1000;

  private static readonly PUPPETEER_ARGS = [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-translate',
    '--disable-sync',
    '--disable-notifications'
  ];

  private static async initialize(): Promise<Browser> {
    if (!this.initializationPromise) {
      this.initializationPromise = puppeteer
        .launch({
          headless: true,
          args: BrowserManager.PUPPETEER_ARGS
        })
        .catch(error => {
          this.initializationPromise = null;
          throw error;
        });
    }
    return this.initializationPromise;
  }

  public static async getBrowser(): Promise<Browser> {
    if (this.isShuttingDown) {
      throw new Error('Browser manager is shutting down');
    }

    try {
      if (!this.instance || !this.instance.isConnected()) {
        this.instance = await this.initialize();
      }
      return this.instance;
    } catch (error) {
      this.instance = null;
      this.initializationPromise = null;
      throw error;
    }
  }

  public static async createPage(): Promise<Page> {
    if (this.activePages.size >= this.MAX_PAGES) {
      throw new Error('Maximum number of concurrent pages reached');
    }

    const browser = await this.getBrowser();
    const context = await browser.createBrowserContext();
    this.activeContexts.add(context);
    const page = await context.newPage();

    const timeout = setTimeout(() => {
      this.closePage(page).catch(console.error);
    }, this.PAGE_TIMEOUT);

    this.pageTimeouts.set(page, timeout);
    this.activePages.add(page);

    return page;
  }

  public static async closePage(page: Page): Promise<void> {
    const timeout = this.pageTimeouts.get(page);
    if (timeout) {
      clearTimeout(timeout);
      this.pageTimeouts.delete(page);
    }

    try {
      if (!page.isClosed()) {
        const context = page.browserContext();

        await page
          .evaluate(() => {
            window.stop();
            document.documentElement.innerHTML = '';
          })
          .catch(console.error);

        await page.close();
        await context.close();

        this.activeContexts.delete(context);
      }
    } catch (error) {
      console.error('Error cleaning up page:', error);
    } finally {
      this.activePages.delete(page);
    }
  }

  public static async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

    try {
      for (const timeout of this.pageTimeouts.values()) {
        clearTimeout(timeout);
      }
      this.pageTimeouts.clear();

      const closePagePromises = Array.from(this.activePages).map(page =>
        this.closePage(page).catch(console.error)
      );
      await Promise.all(closePagePromises);
      this.activePages.clear();

      const closeContextPromises = Array.from(this.activeContexts).map(context =>
        context.close().catch(console.error)
      );
      await Promise.all(closeContextPromises);
      this.activeContexts.clear();

      if (this.instance) {
        await this.instance.close().catch(console.error);
        this.instance = null;
      }

      this.initializationPromise = null;
    } finally {
      this.isShuttingDown = false;
    }
  }
}

const shutdownHandlers = ['exit', 'SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'];
let isShuttingDown = false;

shutdownHandlers.forEach(event => {
  process.on(event, async error => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.error(`Received ${event} signal`, error);
    try {
      await BrowserManager.shutdown();
    } catch (shutdownError) {
      console.error('Error during shutdown:', shutdownError);
    } finally {
      if (event !== 'exit') {
        process.exit(1);
      }
    }
  });
});

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

interface User {
  id: string;
}

const createAuthToken = async (user: User): Promise<string> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign({ userId: user.id }, jwtSecret, {
    issuer: 'FIRST',
    expiresIn: 60
  });
};

const setupPageAuthentication = async (page: Page, url: URL, token: string): Promise<void> => {
  await page.setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });

  const context = page.browserContext();
  await context.setCookie({
    domain: url.hostname,
    path: '/',
    name: 'auth-token',
    value: token,
    secure: true,
    httpOnly: true
  });
};

export async function getLemsWebpageAsPdf(
  path: string,
  user: User,
  options: PDFOptions = {
    format: 'A4',
    margin: { top: '0.18in', bottom: '0.18in', right: '0.18in', left: '0.18in' },
    printBackground: true
  }
): Promise<Buffer> {
  let page: Page | null = null;
  let pdfBuffer: Buffer | null = null;

  try {
    const domain = process.env.LEMS_DOMAIN;
    if (!domain) throw new Error('LEMS_DOMAIN is not configured');

    const url = new URL(domain + path);
    const token = await createAuthToken(user);

    page = await BrowserManager.createPage();

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await setupPageAuthentication(page, url, token);

    await page.goto(url.toString(), {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    await page.evaluate(() => document.fonts.ready);

    const data = await withTimeout(
      page.pdf({
        ...options,
        timeout: 60000
      }),
      75000
    );

    pdfBuffer = Buffer.from(data);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    try {
      if (page) {
        await page
          .evaluate(() => {
            window.stop();
            document.documentElement.innerHTML = '';
          })
          .catch(console.error);

        await BrowserManager.closePage(page);
      }

      page = null;
      pdfBuffer = null;

      if (global.gc) global.gc();
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}
