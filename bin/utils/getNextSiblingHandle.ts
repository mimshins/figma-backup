import { ElementHandle, Page } from "puppeteer";

const getNextSiblingHandle = async (
  page: Page,
  elementHandle: ElementHandle
): Promise<ElementHandle> => {
  const nextSiblingHandle = (
    await page.evaluateHandle(
      (element: HTMLElement) => element.nextElementSibling,
      elementHandle
    )
  ).asElement();

  if (!nextSiblingHandle) throw new Error("Next sibling not found!");

  return nextSiblingHandle;
};

export default getNextSiblingHandle;
