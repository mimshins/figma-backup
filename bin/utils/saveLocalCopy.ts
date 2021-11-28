import clui from "clui";
import { Page } from "puppeteer";
import { log, wait } from ".";
import chalk from "chalk";

const { Spinner } = clui;

interface Options {
  interactionDelay: number;
  typingDelay: number;
  downloadTimeout: number;
}

const saveLocalCopy = async (
  page: Page,
  file: { name: string; id: string },
  options: Options
) => {
  const { interactionDelay, typingDelay, downloadTimeout } = options;

  log(
    chalk.red("\t.") + chalk.bold(` Opening up the figma command pallete...`)
  );
  await wait(interactionDelay);
  await page.keyboard.down("Meta");
  await page.keyboard.press("KeyP");
  await page.keyboard.up("Meta");

  log(chalk.red("\t.") + chalk.bold(` Typing down the download command...`));
  await wait(interactionDelay);
  await page.keyboard.type("save local copy", { delay: typingDelay });

  log(chalk.red("\t.") + chalk.bold(` Execute the download command...`));
  await wait(interactionDelay);
  await page.keyboard.press("Enter");

  const spinner = new Spinner("\t. Waiting for the file to be downloaded...");

  try {
    spinner.start();

    await wait(interactionDelay);
    await page.waitForFunction(
      () => !document.querySelector('[class*="visual_bell--shown"]'),
      { timeout: downloadTimeout }
    );

    spinner.stop();
    log(`\t. File (${file.name}) successfully downloaded.`);
  } catch {
    spinner.stop();
    log(
      chalk.bold.red(
        `\tERR. Download aborted | Timeout of ${Math.round(
          downloadTimeout / 1000
        )}s exceeded.`
      )
    );
  } finally {
    await page.close();
  }
};

export default saveLocalCopy;
