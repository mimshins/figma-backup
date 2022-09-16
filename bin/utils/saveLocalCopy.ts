import chalk from "chalk";
import clui from "clui";
import { KeyInput, Page } from "puppeteer";
import { log, wait } from ".";

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
    chalk.red("\t\t.") + chalk.bold(` Opening up the figma command palette...`)
  );
  await wait(interactionDelay);

  const MainKeyInput: KeyInput =
    process.platform === "darwin" ? "Meta" : "Control";

  await page.keyboard.down(MainKeyInput);
  await page.keyboard.press("KeyP");
  await page.keyboard.up(MainKeyInput);

  try {
    await wait(interactionDelay);
    await page.waitForSelector("[class*='quick_actions--search']", {
      timeout: interactionDelay
    });
  } catch {
    chalk.bold.red("\t\tERR. Couldn't open the figma command palette.");

    await wait(interactionDelay);
    await page.close();
  }

  log(chalk.red("\t\t.") + chalk.bold(` Typing down the download command...`));
  await wait(interactionDelay);
  await page.keyboard.type("save local copy", { delay: typingDelay });

  try {
    await wait(interactionDelay);
    await page.waitForSelector("[class*='quick_actions--result']", {
      timeout: interactionDelay
    });
  } catch {
    chalk.bold.red("\t\tERR. Couldn't find the download command.");

    await wait(interactionDelay);
    await page.close();
  }

  log(chalk.red("\t\t.") + chalk.bold(` Execute the download command...`));
  await wait(interactionDelay);
  await page.keyboard.press("Enter");

  const spinner = new Spinner("\t\t. Waiting for the file to be downloaded...");

  try {
    spinner.start();

    await wait(interactionDelay);
    await page.waitForFunction(
      () => !document.querySelector('[class*="visual_bell--shown"]'),
      { timeout: downloadTimeout }
    );

    spinner.stop();
    log(chalk.green.bold(`\t\t. File (${file.name}) successfully downloaded.`));
  } catch {
    spinner.stop();
    log(
      chalk.bold.red(
        `\t\tERR. Download aborted | Timeout of ${Math.round(
          downloadTimeout / 1000
        )}s exceeded.`
      )
    );
  } finally {
    await wait(2 * interactionDelay);
    await page.close();
  }
};

export default saveLocalCopy;
