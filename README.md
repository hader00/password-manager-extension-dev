# Simple password manager

This repository is part of an assignment for bachelor's thesis.

## Description
The project demonstrates an implementation of password manager
in [electron](https://www.electronjs.org) and [reactjs](https://reactjs.org).

This repository contains Chromium based browser extension. To work properly, the client application needs to be installed.
Default server is running on: [https://password-manager-mysql.herokuapp.com](https://password-manager-mysql.herokuapp.com).

## Related projects
Client application is accessible on: [github.com/hader00/password-manager-dev](https://github.com/hader00/password-manager-dev)

Server is accessible on: [github.com/hader00/password-manager-app-server](https://github.com/hader00/password-manager-app-server)

## How to install
1. Visit [Github Release](https://github.com/hader00/password-manager-extension-dev/releases) and download the latest release of the extension.
2. Unzip the downloaded extension.
3. To install into the browser, open extensions window in browser and click on "Load unpacked" and select the build folder.
4. Download client application from [Github Release](https://github.com/hader00/password-manager-dev/releases). 
5. Additionally, you can build [custom server](https://github.com/hader00/password-manager-app-server/).

## Local installation

### Required dependencies
- [node](https://nodejs.org/en/download/),
- [yarn](https://classic.yarnpkg.com/en/).

Other dependencies will be automatically installed using:

`yarn install`

in the project folder.

## Available Scripts
Builds the app for production to the **build** folder: `yarn build`

Builds the app for production to the **build** folder and creates a zip file to the **dist** folder: `yarn dist`


## Node dependencies update

Install npm-check-updates:

`npm install -g npm-check-updates`

Display new dependencies:

`ncu`

Upgrade all versions in package.json:

`ncu -u`

Download new versions in package.json:

`npm update`


Install new versions in package.json:

`npm install`
