#! /usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import { validate as checkEmailValidity } from "email-validator";
import figlet from "figlet";
import inquirer from "inquirer";
import Bot from "./Bot";
import { VERSION } from "./constants";
import { log } from "./utils";

interface Data {
  email: string;
  password: string;
  accessToken: string;
  projectsIds: string;
  downloadTimeout: number;
  interactionDelay: number;
  typingDelay: number;
}

const displayTitle = () => {
  clear();

  const title = figlet.textSync("FIGMA.\nBACKUP");
  const version = figlet.textSync(
    ` > figma-backup v${VERSION} - INTERACTIVE INTERFACE`,
    { font: "Term" }
  );

  const styledTitle = chalk.magenta(title);
  const styledVersion = chalk.bold.red(version);

  log(`${styledTitle}\n${styledVersion}\n`);
};

const askForData = async () => {
  return inquirer.prompt<Data>([
    {
      name: "email",
      message: "Enter the email address of your figma account:",
      validate: value => {
        if (!value || (<string>value).length === 0)
          return "This argument is required!";

        if (!checkEmailValidity((<string>value).toLowerCase()))
          return "Email address is invalid!";

        return true;
      }
    },
    {
      name: "password",
      type: "password",
      message: "Enter the password of your figma account:",
      validate: value => {
        if (!value || (<string>value).length === 0)
          return "This argument is required!";
        return true;
      }
    },
    {
      name: "accessToken",
      message: "Enter the figma access token:",
      validate: value => {
        if (!value || (<string>value).length === 0)
          return "This argument is required!";
        return true;
      }
    },
    {
      name: "projectsIds",
      message: [
        "Enter the ids of your figma projects:",
        "(Separate the ids with SPACE(s). i.e. ID1 ID2 ID3)"
      ].join("\n")
    },
    {
      name: "downloadTimeout",
      message: [
        "Enter the download timeout (in minutes):",
        "(This number indicates the maximum amount of time the bot has to wait for a file to be downloaded.)"
      ].join("\n"),
      default: 5,
      type: "number"
    },
    {
      name: "interactionDelay",
      message: [
        "Enter the interaction delay (in seconds):",
        "(This number indicates the delay between interactions.)"
      ].join("\n"),
      default: 2,
      type: "number"
    },
    {
      name: "typingDelay",
      message: [
        "Enter the typing delay (in miliseconds):",
        "(This number indicates the delay to type a new character.)"
      ].join("\n"),
      default: 100,
      type: "number"
    }
  ]);
};

const startBot = async (data: Data) => {
  clear();

  log(`${chalk.magenta(figlet.textSync("START"))}\n`);

  await new Bot({
    authData: { email: data.email, password: data.password },
    figmaAccessToken: data.accessToken,
    projectsIds: data.projectsIds.split(" "),
    downloadTimeout: data.downloadTimeout * 60 * 1000,
    interactionDelay: data.interactionDelay * 1000,
    typingDelay: data.typingDelay
  }).start();
};

const run = async () => {
  displayTitle();
  await startBot(await askForData());
};

void run();
