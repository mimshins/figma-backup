import { promises as fs } from "fs";
import type { Cookies, ICookiesProvider } from "./Bot";
import { COOKIES_PATH } from "./constants";

export default class FileSystemCookiesProvider implements ICookiesProvider {
  private _path: string;

  constructor(path = COOKIES_PATH) {
    this._path = path;
  }

  async getCookies(): Promise<Cookies | null> {
    try {
      const cookiesBuffer = await fs.readFile(this._path);
      return JSON.parse(cookiesBuffer.toString()) as Cookies;
    } catch {
      return null;
    }
  }

  async setCookies(cookies: Cookies): Promise<void> {
    await fs.writeFile(this._path, JSON.stringify(cookies));
  }
}
