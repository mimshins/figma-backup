# figma-backup

_**FigmaBackup**_ is a Node.js CLI to backup Figma files and store them as local `.fig` files.

## Installation

1- Make sure you have [Node.js](https://nodejs.org) installed on your machine.

2- Run the following command on your terminal:
```bash
npm install -g figma-backup
```

## Usage

### Basic usage

```bash
figma-backup -e "<YOUR_EMAIL>" -p "<YOUR_PASSWORD>" -t "<YOUR_ACCESS_TOKEN>" --projects-ids "ID1" "ID2" ... "IDx"
```

For more information about the cli options type:

```bash
figma-backup --help
```