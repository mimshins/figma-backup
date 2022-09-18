import { ElementHandle, Page } from "puppeteer";

export interface IElementSearchOptions {
  selector?: string;
  innerHTML?: string | RegExp;
}

const findElementHandle = async (
  page: Page,
  { selector, innerHTML }: IElementSearchOptions
): Promise<ElementHandle> => {
  if (selector) {
    try {
      await page.waitForSelector(selector);
    } catch {
      throw new Error(`Element that matches selector "${selector}" not found.`);
    }
  }

  let targetElementHandle: ElementHandle | null = null;

  if (innerHTML) {
    const handles = await page.$$(selector || "*");

    for (const handle of handles) {
      const currentElementInnerHTML = (await page.evaluate(
        element => element.innerHTML,
        handle
      )) as string;

      if (typeof innerHTML === "string") {
        if (currentElementInnerHTML === innerHTML) {
          targetElementHandle = handle;
        }
      } else if (innerHTML.test(currentElementInnerHTML)) {
        targetElementHandle = handle;
      }
    }
  } else {
    targetElementHandle = await page.$(selector || "*");
  }

  if (targetElementHandle) return targetElementHandle;

  throw new Error(
    `Element${
      String(selector) && ` that matches selector "${String(selector)}"`
    } with innerHTML "${String(innerHTML)}" not found.`
  );
};

export default findElementHandle;
