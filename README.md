# GZMTEC

## Overview

![Version](https://img.shields.io/badge/Version-1.0.0-green)
[![codecov](https://codecov.io/github/Predsu/gzmtec/branch/main/graph/badge.svg)](https://codecov.io/github/Predsu/gzmtec)
![Angular](https://img.shields.io/badge/Angular-21.2.15-blue?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-24.16.0-yellow?logo=node.js)

GZMTEC is Metropolia GZM dedicated, unofficial engine for planning trips with estimated deviations using historical data, running on OTP v2.9.0. It uses database and JavaVM running on a dedicatied server with open and documented API to use at own's call. The engine can be adjusted to any other public transport system when provided with database in the same structure as the original and equivalent of GTFS and PBF files in designated system. The database structure can be adjusted to the other system, however we do not provide support for engines with changed source code.

## Repository Layout

The repository is splitted into two main catalogues:
- `frontend` - provides Angular-driven website sending requests to the API and fetching them into UI, it is a minimal version to provide the most efficient and fastest user experience
- `backend` - provides Node.js server developed in MVC model that runs the API (`server.js`) and archiving new deviations records to the database (`logger.js`). `.env` files has to but put there

## Prerequisities

- npm 11
- Node.js 24
- Angular 21
- OTP 2.9.0
- XAMPP (or any other local database software)

## Installation

1. Run `npm install` in both `frontend` and `backend` catalogue
2. Create the `.env` file in `backend` catalogue, follow the `.env.example`
3. Run `ng g environments` and fill them like that:
```ts
export const environment = {
  production: true/false,
  apiUrl: 'ipaddressofyourserver/localhost' 
};
```
5. Setup a local database with schema located in `template.sql` and fill them with your data.
6. Download GTFS files of your choice. Also get PBF map file of your area. Put them all in a folder of your choice. Remember to have "gtfs" phrase somewhere in GTFS files names. 
7. Run a local OTP instance on your server. The OTP is available [here](https://www.opentripplanner.org/). Localization of OTP jar can be anywhere. You can use the command `java -Xmx8G -jar otp-jar.jar --build --serve ./otp-data` where otp-jar.jar is where your OTP jar is located and ./otp-data is the folder where GTFS and PBF files are located.
8. Run `node server.js` in backend folder and `ng serve --host 0.0.0.0` in frontend folder. Make sure CORS policies do not lock out your app in any way. 
9. The app is available at `localhost:4200`. If you don't want to run only locally we recommend to forward the following apps ports on your router:
- database (if using XAMPP: port 3306)
- JVM with OTP (usually port 8080)
- backend (as we specified in the code port 3000)
- frontend (as we specified in the code port 4200)
Remember to eventually adjust changed addresses in `environments` in frontend and `.env` in backend.