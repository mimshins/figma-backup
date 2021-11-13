export default class BackupError extends Error {
  private _error: Error;

  constructor(error: Error | string) {
    super(
      `Backup failed | ${typeof error === "string" ? error : error.message}`
    );

    this.name = "BackupError";
    this._error = typeof error === "string" ? new Error(error) : error;
  }

  public getError() {
    return this._error;
  }
}
