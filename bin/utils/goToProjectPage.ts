import { Page } from "puppeteer";
import goTo from "./goTo";

const goToProjectPage = async (page: Page, projectId: string) => {
  try {
    await goTo(page, `https://www.figma.com/files/project/${projectId}`);
  } catch {
    throw new Error(`Project with id "${projectId}" page loading failed!`);
  }
};

export default goToProjectPage;
