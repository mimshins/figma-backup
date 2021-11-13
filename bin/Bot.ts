import puppeteer, { Browser, Page } from "puppeteer";
import { AuthorizationError, BackupError } from "./errors";
import FileSystemCookiesProvider from "./FileSystemCookiesProvider";
import {
  checkAuth,
  fetchProjectFiles,
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
  downloadDelay?: number;
  typingDelay?: number;
}

export type Cookie = puppeteer.Protocol.Network.CookieParam;
export type Cookies = Cookie[];

export interface ICookiesProvider {
  getCookies: () => Promise<Cookies | null>;
  setCookies: (cookies: Cookies) => Promise<void>;
}

export default class Bot {
  private _browser: Browser | null = null;
  private _cookiesProvider: ICookiesProvider | null = null;

  private _authData: IBotOptions["authData"];
  private _projectsIds: IBotOptions["projectsIds"];
  private _interactionDelay: NonNullable<IBotOptions["interactionDelay"]>;
  private _downloadDelay: NonNullable<IBotOptions["downloadDelay"]>;
  private _typingDelay: NonNullable<IBotOptions["typingDelay"]>;

  private _debug: NonNullable<IBotOptions["debug"]>;

  // 267872-e4ef1832-60c8-4af8-979a-63e96eac2b88
  private _figmaAccessToken: IBotOptions["figmaAccessToken"];

  constructor(options: IBotOptions) {
    const {
      authData,
      projectsIds,
      figmaAccessToken,
      debug = false,
      downloadDelay = 30 * 1000,
      interactionDelay = 2000,
      typingDelay = 100
    } = options;

    this._authData = authData;

    this._interactionDelay = interactionDelay;
    this._downloadDelay = downloadDelay;
    this._typingDelay = typingDelay;

    this._projectsIds = projectsIds;
    this._figmaAccessToken = figmaAccessToken;

    this._debug = debug;
  }

  private async _login(page: Page): Promise<void> {
    log("\t. Navigating to the login page...");
    await waitAndNavigate(page, page.goto("https://www.figma.com/login"));

    const checkRecent = () =>
      page.url().includes("https://www.figma.com/files/recent");

    if (checkRecent()) {
      log("\t. Bot is already logged in.");
      return;
    }

    try {
      log("\t. Submitting the login form...");
      await waitAndNavigate(
        page,
        submitLoginForm(page, this._authData, {
          interactionDelay: this._interactionDelay,
          typingDelay: this._typingDelay
        })
      );
    } catch (e) {
      throw new AuthorizationError(e as Error);
    }

    if (checkRecent()) {
      log("\t. Bot successfully logged in.");

      if (this._cookiesProvider) {
        const cookies = await page.cookies();
        log("\t. Caching the cookies...");
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

  private async _confirmAuthentication(page: Page): Promise<void> {
    log("> Confirming the authentication...");

    if (!(await checkAuth(page))) {
      if (!this._cookiesProvider) return this._login(page);

      try {
        const cookies = await this._cookiesProvider.getCookies();
        if (!cookies) throw new Error("No cached cookies available!");

        log("\t. Restoring the cached cookies...");
        await page.setCookie(...cookies);

        log("\t. Waiting for the redirection...");
        await waitForRedirects(page);
      } catch (e) {
        throw new AuthorizationError(e as Error);
      } finally {
        if (!(await checkAuth(page))) await this._login(page);
      }
    }
  }

  private async _backupFile(file: { name: string; id: string }): Promise<void> {
    if (!this._browser) return;

    const page: Page = await this._browser.newPage();
    page.setDefaultNavigationTimeout(60 * 1000);

    log(`> Backuping the file(${file.name})...`);

    try {
      log(`\t. Navigating to the file(${file.name})...`);
      await waitAndNavigate(page, goToFilePage(page, file.id));

      await wait(this._interactionDelay);
      await page.waitForFunction(
        () => !document.querySelector('[class*="progress_bar--outer"]')
      );

      log(`\t. Setting the download behaviour...`);
      await wait(this._interactionDelay);
      /* eslint-disable */
      // @ts-ignore
      await page._client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: "./figma-backup-downloads"
      });
      /* eslint-enable */

      log(`\t. Saving a local copy of the file(${file.name})...`);
      await saveLocalCopy(page, file, {
        interactionDelay: this._interactionDelay,
        typingDelay: this._typingDelay,
        downloadDelay: this._downloadDelay
      });
    } catch (e) {
      log(
        `\t. Download aborted | Timeout of ${Math.round(
          this._downloadDelay / 1000
        )}s exceeded.`
      );
      await page.close();
    }
  }

  private async _backupProject(projectId: string): Promise<void> {
    log(`> Fetching the project(${projectId}) files...`);
    const files = (
      await fetchProjectFiles(projectId, this._figmaAccessToken)
    ).map(projectFile => ({ name: projectFile.name, id: projectFile.key }));

    for (const file of files) await this._backupFile(file);
  }

  private async _backupProjects(): Promise<void> {
    if (!this._browser) return;

    const page = (await this._browser.pages())[0];
    page.setDefaultNavigationTimeout(60 * 1000);

    try {
      await this._confirmAuthentication(page);

      for (const projectId of this._projectsIds)
        await this._backupProject(projectId);
    } catch (e) {
      await this.stop();
      throw new BackupError(e as Error);
    }
  }

  public async start(): Promise<void> {
    this._browser = await puppeteer.launch({ headless: !this._debug });
    this._cookiesProvider = new FileSystemCookiesProvider();

    const _timer = timer();

    log("> Starting the backup task...");
    _timer.start();
    await this._backupProjects();
    log(`Backup task finished! (time elapsed: ${_timer.end()}s)`);
  }

  public async stop(): Promise<void> {
    log("> Stopping the bot...");

    if (this._browser) await this._browser.close();
    if (this._cookiesProvider) this._cookiesProvider = null;
    this._browser = null;
  }
}
