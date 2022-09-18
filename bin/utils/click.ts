import { ElementHandle, Page } from "puppeteer";
import random from "./random";

type ClientRect = Record<"x" | "y" | "width" | "height", number>;

const click = async (
  page: Page,
  elementHandle: ElementHandle
): Promise<void> => {
  const clientRect = (await page.evaluate(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }, elementHandle)) as ClientRect;

  await page.mouse.click(
    clientRect.x + random(0, clientRect.width),
    clientRect.y + random(0, clientRect.height)
  );
};

export default click;
