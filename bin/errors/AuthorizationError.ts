export default class AuthorizationError extends Error {
  private _error: Error;

  constructor(error: Error | string) {
    super(
      `Authorization failed | ${
        typeof error === "string" ? error : error.message
      }`
    );

    this.name = "AuthorizationError";
    this._error = typeof error === "string" ? new Error(error) : error;
  }

  public getError() {
    return this._error;
  }
}
