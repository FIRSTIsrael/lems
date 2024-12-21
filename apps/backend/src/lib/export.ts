import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import jwt from 'jsonwebtoken';
import * as db from '@lems/database';
import { WithId } from 'mongodb';
import { SafeUser } from '@lems/types';

class BrowserManager {
  private static instance: Browser | null = null;
  private static activePages: Set<Page> = new Set();
  private static isShuttingDown = false;
  private static initializationPromise: Promise<Browser> | null = null;
  private static pageTimeouts: Map<Page, NodeJS.Timeout> = new Map();
  private static readonly MAX_PAGES = 25;
  private static readonly PAGE_TIMEOUT = 5 * 60 * 1000;

  private static readonly PUPPETEER_ARGS = [
    // Security
    '--no-sandbox', // Disables Chrome sandbox. Required when running as root/in Docker. Security implications - use in trusted environments only.

    // Memory Management
    '--disable-dev-shm-usage', // Prevents running out of memory in containers by not using /dev/shm. Essential for Docker.
    '--disable-gpu', // Disables GPU hardware acceleration. Reduces memory usage and prevents issues in headless environments.

    // Performance Critical
    '--disable-extensions', // Disables Chrome extensions. Reduces memory footprint and prevents interference.
    '--disable-background-networking', // Prevents background network requests that can leak memory.
    '--disable-background-timer-throttling', // Prevents timers being throttled in background tabs, ensuring consistent cleanup.

    // Recommended Additional Flags
    '--disable-translate', // Disables the translation feature. Removes unnecessary overhead.
    '--disable-sync', // Disables Chrome sync features. Removes unnecessary overhead.
    '--disable-notifications' // Disables notification features. Removes unnecessary overhead.
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
    const page = await browser.newPage();

    const timeout = setTimeout(() => {
      this.closePage(page).catch(console.error);
    }, this.PAGE_TIMEOUT);

    this.pageTimeouts.set(page, timeout);
    this.activePages.add(page);

    return page;
  }

  public static async closePage(page: Page): Promise<void> {
    try {
      const timeout = this.pageTimeouts.get(page);
      if (timeout) {
        clearTimeout(timeout);
        this.pageTimeouts.delete(page);
      }

      if (!page.isClosed()) {
        await page
          .evaluate(() => {
            window.stop();
            const elements = document.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              element.remove();
            }
          })
          .catch(console.error);

        await page.close();
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

// Graceful application shutdown handlers
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

const createAuthToken = async (user: WithId<SafeUser>): Promise<string> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign({ userId: user._id }, jwtSecret, {
    issuer: 'FIRST',
    expiresIn: 60
  });
};

const setupPageAuthentication = async (page: Page, url: string, token: string): Promise<void> => {
  await page.setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });
  await page.setCookie({
    url,
    path: '/',
    name: 'auth-token',
    value: token,
    secure: true,
    httpOnly: true
  });
};

export async function getLemsWebpageAsPdf(
  path: string,
  options: PDFOptions = {
    format: 'A4',
    margin: { top: '0.18in', bottom: '0.18in', right: '0.18in', left: '0.18in' },
    printBackground: true
  }
): Promise<Buffer> {
  let page: Page | null = null;

  try {
    const domain = process.env.LEMS_DOMAIN;
    if (!domain) {
      throw new Error('LEMS_DOMAIN is not configured');
    }

    const url = domain + path;
    const user = await db.getUser({ username: 'admin' });
    const token = await createAuthToken(user);

    page = await BrowserManager.createPage();

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await setupPageAuthentication(page, url, token);

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (!page.isClosed()) {
        // Only block media, websockets, and other non-essential resources
        // Allow images, fonts, and stylesheets for proper PDF rendering
        if (['media', 'websocket', 'other'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      } else {
        request.abort();
      }
    });

    await page.goto(url, {
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

    return Buffer.from(data);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (page) {
      await BrowserManager.closePage(page);
    }
  }
}
