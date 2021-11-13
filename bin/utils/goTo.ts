import { Page } from "puppeteer";
import waitForRedirects from "./waitForRedirects";

const goTo = async (page: Page, targetURL: string) => {
  if (page.url().includes(targetURL)) return;

  await page.goto(targetURL);
  await waitForRedirects(page, { timeout: 5000 });

  if (!page.url().includes(targetURL)) throw new Error(`Page loading failed.`);
};

export default goTo;
