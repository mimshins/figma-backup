<div align="center">
  <h1>Figma Backup Bot</h1>
  <p>A Node.js CLI to backup Figma files and store them as local <code>.fig</code> files.</p>
  <img src="https://img.shields.io/npm/dt/figma-backup?color=d900ff&labelColor=000000&style=for-the-badge" />
  <img src="https://img.shields.io/github/license/mimshins/figma-backup?color=d900ff&labelColor=000000&style=for-the-badge" />
  <img src="https://img.shields.io/npm/v/figma-backup?color=d900ff&labelColor=000000&style=for-the-badge" />
  <a title="twitter" href="https://twitter.com/mimshins" target="_blank"><img src="https://img.shields.io/twitter/follow/mimshins?color=d900ff&labelColor=000000&logo=twitter&style=for-the-badge" /></a>
</div>

<hr />

## Installation

1- Make sure you have [Node.js](https://nodejs.org) installed on your machine.

2- Run the following command on your terminal:
```bash
npm install -g figma-backup
```

or install it via [Yarn](https://yarnpkg.com/):

```bash
yarn global add figma-backup
```

This will download and install the node package and a recent compatible version of Chromium (~170MB Mac, ~282MB Linux, ~280MB Win) in your global `node_modules` directory (You can find it via `npm list -g | head -1`).

---

**Note:** If the installation stopped with the 403 Error (Forbidden), you'll have to use a VPN or Proxy to another region/country in order to access the Chromium source.

**Note (Linux Machines):** Make sure all the necessary dependencies are installed. You can go to the `<path_to_node_modules>/node_modules/puppeteer/.local-chromium/linux-******/chrome-linux` and run `ldd chrome | grep not` on a Linux machine to check which dependencies are missing. The common ones are provided below.

<details>
<summary>Debian (e.g. Ubuntu) Dependencies</summary>

```
ca-certificates
fonts-liberation
libappindicator3-1
libasound2
libatk-bridge2.0-0
libatk1.0-0
libc6
libcairo2
libcups2
libdbus-1-3
libexpat1
libfontconfig1
libgbm1
libgcc1
libglib2.0-0
libgtk-3-0
libnspr4
libnss3
libpango-1.0-0
libpangocairo-1.0-0
libstdc++6
libx11-6
libx11-xcb1
libxcb1
libxcomposite1
libxcursor1
libxdamage1
libxext6
libxfixes3
libxi6
libxrandr2
libxrender1
libxss1
libxtst6
lsb-release
wget
xdg-utils
```
</details>

<details>
<summary>CentOS Dependencies</summary>

```
alsa-lib.x86_64
atk.x86_64
cups-libs.x86_64
gtk3.x86_64
ipa-gothic-fonts
libXcomposite.x86_64
libXcursor.x86_64
libXdamage.x86_64
libXext.x86_64
libXi.x86_64
libXrandr.x86_64
libXScrnSaver.x86_64
libXtst.x86_64
pango.x86_64
xorg-x11-fonts-100dpi
xorg-x11-fonts-75dpi
xorg-x11-fonts-cyrillic
xorg-x11-fonts-misc
xorg-x11-fonts-Type1
xorg-x11-utils
```

After installing dependencies you need to update nss library using this command

```bash
yum update nss -y
```
</details>

---

## Usage

To use the interactive command-line interface, run:

```bash
figma-backup-interactive
```

To use the legacy version, run:

```bash
figma-backup -e "<YOUR_EMAIL>" -p "<YOUR_PASSWORD>" -t "<YOUR_ACCESS_TOKEN>" --projects-ids "ID1" "ID2" ... "IDx"
```

For more information about the legacy cli options type:

```bash
figma-backup --help
```
## Output

The backup files will be found in `figma-backup-root` directory relative to the working directory which you ran the `figma-backup` command.
