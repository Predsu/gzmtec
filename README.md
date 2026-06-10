# GZMTEC

## Overview

![Version](https://img.shields.io/badge/Version-1.0.0-green)
[![codecov](https://codecov.io/gh/TWÓJ_USER/TWOJE_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/Predsu/gzmtec)
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

## Installation (DEV)

### Option A - using public server

This option assumes the user doesn't want to set up their own local database and JavaVM running the engine. However it still assumes that frontend and backend processing the connections with remote server will be running locally. For installation of already built product see Option B.

1. Run `npm install` in both `frontend` and `backend` catalogue
2. Create the `.env` file in `backend` catalogue, for public server it should look like that:
```
PORT = 3000
DB_HOST = 'gzmtec.duckdns.org'
DB_PORT = 8801
DB_USER = 'gzmtec_public'
DB_PASSWORD = ''
DB_DBNAME = 'gzmtec'
DB_FRONTEND_URL = 'http://localhost:4200'
JVM_HOST = 'gzmtec.duckdns.org'
JVM_PORT = 8803
```
3. Requests to the engine are available through URL: `localhost:4200/plan-trip`

### Option B - Getting Pre-Built App (Android)

WIP

## 