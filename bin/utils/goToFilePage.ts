import { Page } from "puppeteer";
import goTo from "./goTo";

const goToFilePage = async (page: Page, fileId: string) => {
  try {
    await goTo(page, `https://www.figma.com/file/${fileId}`);
  } catch (e) {
    throw new Error(`File with id "${fileId}" page loading failed!`);
  }
};

export default goToFilePage;
