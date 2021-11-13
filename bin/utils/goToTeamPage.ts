import { Page } from "puppeteer";
import goTo from "./goTo";

const goToTeamPage = async (page: Page, teamId: string) => {
  try {
    await goTo(page, `https://www.figma.com/files/team/${teamId}`);
  } catch {
    throw new Error(`Team with id "${teamId}" page loading failed!`);
  }
};

export default goToTeamPage;
