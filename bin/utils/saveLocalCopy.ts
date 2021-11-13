import { Page } from "puppeteer";
import { log, timer, wait } from ".";

interface Options {
  interactionDelay: number;
  typingDelay: number;
  downloadDelay: number;
}

const saveLocalCopy = async (
  page: Page,
  file: { name: string; id: string },
  options: Options
) => {
  const { interactionDelay, typingDelay, downloadDelay } = options;

  log("\t. Opening up the figma command pallete...");
  await wait(interactionDelay);
  await page.keyboard.down("Meta");
  await page.keyboard.press("KeyP");
  await page.keyboard.up("Meta");

  log("\t. Typing down the download command...");
  await wait(interactionDelay);
  await page.keyboard.type("save local copy", { delay: typingDelay });

  log("\t. Selecting the right command via enter...");
  await wait(interactionDelay);
  await page.keyboard.press("Enter");

  log("\t. Waiting for the file to be downloaded...");
  await wait(interactionDelay);
  const _timer = timer();

  _timer.start();
  await page.waitForFunction(
    () => !document.querySelector('[class*="visual_bell--shown"]'),
    { timeout: downloadDelay }
  );
  const _endTime = _timer.end();

  log(
    `\t. File (${file.name}) successfully downloaded. (duration: ${_endTime}s)`
  );
};

export default saveLocalCopy;
