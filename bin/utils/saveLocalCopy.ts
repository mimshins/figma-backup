import chalk from "chalk";
import clui from "clui";
import { KeyInput, Page } from "puppeteer";
import log from "./log";
import wait from "./wait";

const { Spinner } = clui;

interface Init {
  interactionDelay: number;
  typingDelay: number;
  downloadTimeout: number;
}

const saveLocalCopy = async (
  page: Page,
  file: { name: string; id: string },
  init: Init
) => {
  const { interactionDelay, typingDelay, downloadTimeout } = init;

  log(
    chalk.red("\t\t.") + chalk.bold(` Opening up the figma command palette...`)
  );

  const MainKeyInput: KeyInput =
    process.platform === "darwin" ? "Meta" : "Control";

  await page.keyboard.down(MainKeyInput);
  await page.keyboard.press("KeyP");
  await page.keyboard.up(MainKeyInput);

  try {
    await page.waitForSelector("[class*='quick_actions--search']", {
      timeout: interactionDelay
    });
  } catch {
    log(chalk.bold.red("\t\tERR. Couldn't open the figma command palette."));

    await wait(interactionDelay);
    await page.close();
  }

  log(chalk.red("\t\t.") + chalk.bold(` Typing down the download command...`));
  await page.keyboard.type("save local copy", { delay: typingDelay });

  try {
    await page.waitForSelector("[class*='quick_actions--result']", {
      timeout: interactionDelay
    });
  } catch {
    log(chalk.bold.red("\t\tERR. Couldn't find the download command."));

    await wait(interactionDelay);
    await page.close();
  }

  log(chalk.red("\t\t.") + chalk.bold(` Execute the download command...`));
  await page.keyboard.press("Enter");

  const spinner = new Spinner("\t\t. Waiting for the file to be downloaded...");

  try {
    spinner.start();
    await page.waitForNetworkIdle({
      timeout: downloadTimeout,
      idleTime: 5000 + interactionDelay
    });
    spinner.stop();
    log(
      chalk.green.bold(
        `\t\t. File (${file.name}) successfully downloaded.` +
          "\n\t\t  (You are seeing this message because the bot has detected network idleness and assumes the download has finished)"
      )
    );
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
