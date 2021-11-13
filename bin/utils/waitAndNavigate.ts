import { Page } from "puppeteer";

const waitAndNavigate = async <T>(
  page: Page,
  navigationPromise: Promise<T>
) => {
  await Promise.all([page.waitForNavigation(), navigationPromise]);
};

export default waitAndNavigate;
