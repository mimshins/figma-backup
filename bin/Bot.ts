import chalk from "chalk";
import clui from "clui";
import fs from "fs";
import path from "path";
import puppeteer, { Browser, Page } from "puppeteer";
import { BACKUP_DIR, COOKIES_PATH, ROOT_DIR } from "./constants";
import { AuthorizationError, BackupError } from "./errors";
import FileSystemCookiesProvider from "./FileSystemCookiesProvider";
import {
  fetchProject,
  goToFilePage,
  log,
  parseLoginFormError,
  saveLocalCopy,
  submitLoginForm,
  timer,
  wait,
  waitAndNavigate,
  waitForRedirects
} from "./utils";

const { Spinner } = clui;

export interface IAuthData {
  email: string;
  password: string;
}

export interface IBotOptions {
  authData: IAuthData;
  projectsIds: string[];
  figmaAccessToken: string;
  debug?: boolean;
  interactionDelay?: number;
  downloadTimeout?: number;
  typingDelay?: number;
}

export type Cookie = puppeteer.Protocol.Network.CookieParam;
export type Cookies = Cookie[];

export interface SessionData {
  cookies: Cookies | null;
  date: Date | null;
}

export interface ICookiesProvider {
  getCookies: () => Promise<Cookies | null>;
  setCookies: (cookies: Cookies) => Promise<void>;
}

const SESSION_DATA: SessionData = { cookies: null, date: null };

export default class Bot {
  private _browser: Browser | null = null;
  private _cookiesProvider: ICookiesProvider = new FileSystemCookiesProvider();

  private _authData: IBotOptions["authData"];
  private _projectsIds: IBotOptions["projectsIds"];
  private _interactionDelay: NonNullable<IBotOptions["interactionDelay"]>;
  private _downloadTimeout: NonNullable<IBotOptions["downloadTimeout"]>;
  private _typingDelay: NonNullable<IBotOptions["typingDelay"]>;

  private _debug: NonNullable<IBotOptions["debug"]>;

  private _figmaAccessToken: IBotOptions["figmaAccessToken"];

  constructor(options: IBotOptions) {
    const {
      authData,
      projectsIds,
      figmaAccessToken,
      debug = false,
      downloadTimeout = 30 * 1000,
      interactionDelay = 2000,
      typingDelay = 100
    } = options;

    this._authData = authData;

    this._interactionDelay = interactionDelay;
    this._downloadTimeout = downloadTimeout;
    this._typingDelay = typingDelay;

    this._projectsIds = projectsIds;
    this._figmaAccessToken = figmaAccessToken;

    this._debug = debug;
  }

  private async _login(page: Page): Promise<void> {
    let spinner = new Spinner("\t. Navigating to the login page...");

    spinner.start();
    await waitAndNavigate(page, page.goto("https://www.figma.com/login"));
    spinner.stop();

    const checkRecent = () =>
      page.url().includes("https://www.figma.com/files/recent");

    if (checkRecent()) {
      log(chalk.red("\t.") + chalk.bold(` Bot is already logged in.`));
      return;
    }

    try {
      spinner = new Spinner("\t. Submitting the login form...");

      spinner.start();
      await waitAndNavigate(
        page,
        submitLoginForm(page, this._authData, {
          interactionDelay: this._interactionDelay,
          typingDelay: this._typingDelay
        })
      );
      spinner.stop();
    } catch (e) {
      throw new AuthorizationError(e as Error);
    }

    if (checkRecent()) {
      log(chalk.red("\t.") + chalk.bold(` Bot successfully logged in.`));

      if (this._cookiesProvider) {
        const cookies = await page.cookies();

        log(chalk.red("\t.") + chalk.bold(` Caching the cookies...`));
        SESSION_DATA.cookies = cookies;
        await this._cookiesProvider.setCookies(cookies);
      }
    } else if (page.url() === "https://www.figma.com/login") {
      const error = await parseLoginFormError(page);
      throw new AuthorizationError(error || "unknown error");
    } else {
      throw new AuthorizationError(
        `Unexpectedly redirected to "${page.url()}"`
      );
    }
  }

  private async _authenticate(page: Page): Promise<void> {
    log(chalk.red(">") + chalk.bold(` Authenticating the bot...`));

    await this._login(page);

    try {
      log(chalk.red("\t.") + chalk.bold(` Looking for cached cookies...`));
      const cookies =
        (await this._cookiesProvider.getCookies()) || SESSION_DATA.cookies;

      if (!cookies) throw new Error("No cached cookies found.");

      log(chalk.red("\t.") + chalk.bold(` Restoring the cached cookies...`));
      await page.setCookie(...cookies);

      const spinner = new Spinner("\t. Waiting for the redirection...");
      spinner.start();
      await waitForRedirects(page);
      spinner.stop();
    } catch (e) {
      throw new AuthorizationError(e as Error);
    }
  }

  private async _backupFile(
    file: { name: string; id: string },
    projectName: string
  ): Promise<void> {
    if (!this._browser) return;

    const page: Page = await this._browser.newPage();
    page.setDefaultNavigationTimeout(60 * 1000);

    let spinner = new Spinner(`\t. Navigating to the file(${file.name})...`);

    log(chalk.red(">") + chalk.bold(` Backuping the file(${file.name})...`));

    spinner.start();
    await waitAndNavigate(page, goToFilePage(page, file.id));
    spinner.stop();

    spinner = new Spinner("\t. Waiting for the page to be loaded...");

    spinner.start();
    await wait(this._interactionDelay);
    await page.waitForFunction(
      () => !document.querySelector('[class*="progress_bar--outer"]')
    );
    spinner.stop();

    log(chalk.red("\t.") + chalk.bold(` Setting the download behaviour...`));
    await wait(this._interactionDelay);
    /* eslint-disable */
    // @ts-ignore
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: path.join(
        BACKUP_DIR,
        SESSION_DATA.date!.toISOString(),
        projectName
      )
    });
    /* eslint-enable */

    log(
      chalk.red("\t.") +
        chalk.bold(` Saving a local copy of the file(${file.name})...`)
    );
    await saveLocalCopy(page, file, {
      interactionDelay: this._interactionDelay,
      typingDelay: this._typingDelay,
      downloadTimeout: this._downloadTimeout
    });
  }

  private async _backupProject(projectId: string): Promise<void> {
    const spinner = new Spinner(
      `> Fetching the project(${projectId}) files...`
    );

    spinner.start();
    const project = await fetchProject(projectId, this._figmaAccessToken);
    const projectName = project.name;
    spinner.stop();

    const files = project.files.map(file => ({
      name: file.name,
      id: file.key
    }));

    for (const file of files) await this._backupFile(file, projectName);
  }

  private async _backupProjects(): Promise<void> {
    if (!this._browser) return;

    const page = (await this._browser.pages())[0];
    page.setDefaultNavigationTimeout(60 * 1000);

    try {
      await this._authenticate(page);

      for (const projectId of this._projectsIds)
        await this._backupProject(projectId);
    } catch (e) {
      await this.stop();
      throw new BackupError(e as Error);
    }
  }

  public async start(): Promise<void> {
    this._browser = await puppeteer.launch({ headless: !this._debug });

    SESSION_DATA.date = new Date();

    const _timer = timer();

    if (!fs.existsSync(ROOT_DIR)) fs.mkdirSync(ROOT_DIR);
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    if (fs.existsSync(COOKIES_PATH)) fs.rmSync(COOKIES_PATH);

    log(chalk.red(">") + chalk.bold(" Starting the backup task..."));
    _timer.start();
    await this._backupProjects();
    log(chalk.red(`Backup task finished! (time elapsed: ${_timer.end()}s)`));
  }

  public async stop(): Promise<void> {
    log(chalk.red(">") + chalk.bold(" Stopping the bot..."));

    if (this._browser) await this._browser.close();
    this._browser = null;
  }
}
