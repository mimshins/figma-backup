import { ElementHandle, Page } from "puppeteer";

const getNextSiblingHandle = async (
  page: Page,
  elementHandle: ElementHandle
): Promise<ElementHandle<Node>> => {
  const nextSiblingHandle = (
    await page.evaluateHandle(
      element => element.nextElementSibling,
      elementHandle
    )
  ).asElement();

  if (!nextSiblingHandle) throw new Error("Next sibling not found!");

  return nextSiblingHandle;
};

export default getNextSiblingHandle;
