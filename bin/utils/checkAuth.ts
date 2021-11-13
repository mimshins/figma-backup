import { Page } from "puppeteer";
import waitAndNavigate from "./waitAndNavigate";

const checkAuth = async (page: Page): Promise<boolean> => {
  const checkRecent = () =>
    page.url().includes("https://www.figma.com/files/recent");

  if (checkRecent()) return true;

  await waitAndNavigate(page, page.goto("https://www.figma.com/files/recent"));

  return checkRecent();
};

export default checkAuth;
