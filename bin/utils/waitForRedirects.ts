import { Page } from "puppeteer";

interface Options {
  redirectsLimit?: number;
  timeout?: number;
}

const waitForRedirects = async (page: Page, options?: Options) => {
  const { redirectsLimit = 10, timeout = 7000 } = options || {};

  try {
    for (let i = 0; i < redirectsLimit; i++)
      await page.waitForNavigation({ timeout });
  } catch {
    return;
  }
};

export default waitForRedirects;
