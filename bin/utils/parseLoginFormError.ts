import { Page } from "puppeteer";
import findElementHandle from "./findElementHandle";

const parseLoginFormError = async (page: Page): Promise<null | string> => {
  const emailInputHandle = await findElementHandle(page, {
    selector: 'form#auth-view-page > input[name="email"]'
  });

  const passwordInputHandle = await findElementHandle(page, {
    selector: 'form#auth-view-page > input[name="password"]'
  });

  return (await page.evaluate(
    (emailInput, passwordInput) => {
      if (emailInput.className.includes("invalidInput")) return "Invalid email";
      if (passwordInput.className.includes("invalidInput"))
        return "Invalid password";
      return null;
    },
    emailInputHandle,
    passwordInputHandle
  )) as string | null;
};

export default parseLoginFormError;
