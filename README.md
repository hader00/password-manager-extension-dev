# Simple password manager

This repository is part of an assignment for bachelor's thesis.

## Description
The project demonstrates an implementation of password manager
in [electron](https://www.electronjs.org) and [reactjs](https://reactjs.org).

This repository contains Chromium based browser extension. To work properly the client application needs to be installed.

## Other parts
Client application is accessible on: [github.com/hader00/password-manager-dev](https://github.com/hader00/password-manager-dev)

Server is accessible on: [github.com/hader00/password-manager-app-server](https://github.com/hader00/password-manager-app-server)


## Available Scripts

In the project directory, you can run:

### `yarn build`

Builds the app for production to the `build` folder.

To install into the browser, open extensions windows and click on "Load unpacked" and select the build folder.

### `yarn dist`

Builds the app for production to the `build` folder and creates a zip file to the `dist` folder.

To install into the browser, unzip `chrome-extension.zip` form `dist` folder, open extensions windows and click on "Load unpacked" and select the unzipped contents.


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
