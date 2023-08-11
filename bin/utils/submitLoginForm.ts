import { Page } from "puppeteer";
import type { IAuthData } from "../Bot";
import wait from "./wait";

interface Options {
  interactionDelay: number;
  typingDelay: number;
}

const submitLoginForm = async (
  page: Page,
  authData: IAuthData,
  options: Options
) => {
  const { interactionDelay, typingDelay } = options;

  await page.bringToFront();

  // Focus the email field
  await wait(interactionDelay);
  await page.click('form#auth-view-page > input[name="email"]');

  // Fill the email field
  await wait(interactionDelay);
  await page.keyboard.type(authData.email, { delay: typingDelay });

  // Focus the password field
  await page.click('form#auth-view-page > input[name="password"]');

  // Fill the password field
  await page.keyboard.type(authData.password, { delay: typingDelay });

  // Submit the form
  await page.click('form#auth-view-page > button[type="submit"]');
};

export default submitLoginForm;
