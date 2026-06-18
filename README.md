<div align="center">

# GZMTEC

<u>Transforming Public Transport with Smarter, Real-Time Insights</u>

## Overview

![Version](https://img.shields.io/badge/Version-0.1.0-yellow)
<img alt="GitHub License" src="https://img.shields.io/github/license/Predsu/gzmtec">
[![codecov](https://codecov.io/github/Predsu/gzmtec/branch/main/graph/badge.svg)](https://codecov.io/github/Predsu/gzmtec)
<img src="https://img.shields.io/github/last-commit/Predsu/gzmtec?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/w/Predsu/gzmtec">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" alt="Express">
<img src="https://img.shields.io/badge/Angular-505050.svg?style=flat&logo=Angular&logoColor=red" alt="Angular">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Chai-A30701.svg?style=flat&logo=Chai&logoColor=white" alt="Chai">
<img src="https://img.shields.io/badge/Mocha-8D6748.svg?style=flat&logo=Mocha&logoColor=white" alt="Mocha">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/Vitest-6E9F18.svg?style=flat&logo=Vitest&logoColor=white" alt="Vitest">
<img src="https://img.shields.io/badge/Android-34A853.svg?style=flat&logo=Android&logoColor=white" alt="Android">
<img src="https://img.shields.io/badge/Gradle-02303A.svg?style=flat&logo=Gradle&logoColor=white" alt="Gradle">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" alt="Axios">
<img src="https://img.shields.io/badge/Bootstrap-7952B3.svg?style=flat&logo=Bootstrap&logoColor=white" alt="Bootstrap">
<img src="https://img.shields.io/badge/Jest-C21325.svg?style=flat&logo=Jest&logoColor=white" alt="Jest">

<br>

<!-- ![Angular](https://img.shields.io/badge/Angular-21.2.15-blue?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-24.16.0-yellow?logo=node.js)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple?logo=bootstrap)
![Jest](https://img.shields.io/badge/Jest-30.4.2-red?logo=jest) -->


GZMTEC is Metropolia GZM dedicated, unofficial engine for planning trips with estimated deviations using historical data, running on OTP v2.9.0. It uses database and JavaVM running on a dedicatied server with open and documented API to use at own's call. The engine can be adjusted to any other public transport system when provided with database in the same structure as the original and equivalent of GTFS and PBF files in designated system. The database structure can be adjusted to the other system, however we do not provide support for engines with changed source code. The project is available on browsers and as an Android 7+ native app.

</div>

## Project Structure

```sh
└── gzmtec/
    ├── .github
    │   └── workflows
    ├── API_DOCUMENTATION.md
    ├── LICENSE
    ├── README.md
    ├── backend
    │   ├── .env.example
    │   ├── config
    │   ├── controllers
    │   ├── coverage
    │   ├── logger.js
    │   ├── middleware
    │   ├── models
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── routes
    │   ├── scripts
    │   ├── server.js
    │   ├── services
    │   └── tests
    ├── frontend
    │   ├── .editorconfig
    │   ├── .gitignore
    │   ├── .prettierrc
    │   ├── .vscode
    │   ├── android
    │   ├── angular.json
    │   ├── capacitor.config.ts
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── public
    │   ├── src
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   └── tsconfig.spec.json
    ├── package-lock.json
    ├── package.json
    └── template.sql
```

The repository is splitted into two main catalogues:
- `frontend` - provides Angular-driven website sending requests to the API and fetching them into UI, it is a minimal version to provide the most efficient and fastest user experience
- `backend` - provides Node.js server developed in MVC model that runs the API (`server.js`) and archiving new deviations records to the database (`logger.js`). `.env` files has to but put there

## Project Index (backend only)

<details open>
	<summary><b><code>GZMTEC/</code></b></summary>
  <details>
		<summary><b>backend</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ backend</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/server.js'>server.js</a></b></td>
					<td style='padding: 8px;'>- Sets up the core Express server to handle API requests, manage middleware, and route traffic to specific controllers and endpoints<br>- It establishes the applications main entry point, enabling communication between clients and backend services, and integrates essential configurations such as environment variables, CORS policies, and database connections to support the overall architecture.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/.env.example'>.env.example</a></b></td>
					<td style='padding: 8px;'>- Defines environment variables essential for configuring backend services, including database connections, server ports, and authentication secrets<br>- Facilitates seamless setup and deployment by providing standardized parameters for connecting to the database, frontend, and JVM components, ensuring consistent environment configuration across development and production environments within the overall architecture.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>- Facilitates core backend functionalities including user authentication, data management, and API interactions within the application architecture<br>- It integrates essential dependencies for server operations, security, and database connectivity, supporting a scalable and secure environment for client-server communication<br>- This component ensures reliable handling of user data and authentication processes, forming the backbone of the applications backend infrastructure.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/logger.js'>logger.js</a></b></td>
					<td style='padding: 8px;'>- Initialize and configure the deviation logging service within the backend architecture, enabling real-time monitoring of deviations or anomalies<br>- By setting up environment variables, database connections, and starting the deviation logger, it ensures continuous oversight of system performance and issues, supporting proactive maintenance and operational transparency across the entire codebase.</td>
				</tr>
			</table>
			<!-- controllers Submodule -->
			<details>
				<summary><b>controllers</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.controllers</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/controllers/tripPlanner.controller.js'>tripPlanner.controller.js</a></b></td>
							<td style='padding: 8px;'>- Provides route planning and real-time transit deviation estimation by integrating external trip data with live vehicle positions and historical deviation records<br>- Facilitates accurate, timely public transportation itineraries, enhancing user experience through dynamic adjustments based on current conditions and historical patterns within the broader transportation system architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/controllers/apiStatus.controller.js'>apiStatus.controller.js</a></b></td>
							<td style='padding: 8px;'>- Provides an endpoint to retrieve the current API status, serving as a health check within the backend architecture<br>- It facilitates monitoring and ensures system availability by delivering real-time status information, supporting overall system reliability and operational transparency across the applications services.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/controllers/user.controller.js'>user.controller.js</a></b></td>
							<td style='padding: 8px;'>- Defines core user management functionalities, including registration, authentication, and handling user-specific favorite routes<br>- Facilitates secure login via JWT tokens and manages user data interactions with the database, supporting personalized features within the applications architecture<br>- Serves as a key controller layer connecting user actions to backend data operations.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/controllers/deviationLogger.controller.js'>deviationLogger.controller.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates logging of deviations related to trips, lines, stops, and vehicles within the backend architecture<br>- It acts as an intermediary that receives deviation data, invokes the data model to store the information, and responds with success or error messages<br>- This component ensures accurate tracking of operational anomalies, supporting overall system monitoring and analysis.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/controllers/deviationOperations.controller.js'>deviationOperations.controller.js</a></b></td>
							<td style='padding: 8px;'>- Provides an API endpoint to estimate deviation metrics for transit stops based on line, stop, and time parameters<br>- It retrieves average deviation data, processes it to compute a meaningful statistic, and returns comprehensive results<br>- This controller facilitates real-time deviation analysis, supporting the broader systems goal of monitoring and optimizing transit operations.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- config Submodule -->
			<details>
				<summary><b>config</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.config</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/config/cache.js'>cache.js</a></b></td>
							<td style='padding: 8px;'>- Establishes a caching mechanism to optimize data retrieval and reduce backend load by storing temporary data with a 24-hour expiration<br>- Integral to the overall architecture, it enhances application performance and scalability by efficiently managing frequently accessed data across the backend services.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/config/db.js'>db.js</a></b></td>
							<td style='padding: 8px;'>- Establishes a centralized connection pool to the MySQL database, enabling efficient and scalable data access across the backend<br>- It manages database configurations securely via environment variables, ensuring reliable connectivity and resource management for data operations within the overall application architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- scripts Submodule -->
			<details>
				<summary><b>scripts</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.scripts</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/scripts/deviationLogger.js'>deviationLogger.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates automated logging of active vehicle deviations at regular intervals, supporting real-time monitoring and data collection within the system<br>- Integrates with the deviation logging service to ensure consistent recording of deviation data, enabling timely detection and analysis of vehicle performance issues across the entire architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- middleware Submodule -->
			<details>
				<summary><b>middleware</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.middleware</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/middleware/envValidator.middleware.js'>envValidator.middleware.js</a></b></td>
							<td style='padding: 8px;'>- Ensures the integrity of the applications environment configuration by verifying the presence of essential environment variables during startup<br>- This validation step prevents runtime errors related to missing configuration, supporting reliable deployment and operation within the overall backend architecture<br>- It acts as a safeguard, maintaining consistency and stability across the systems environment setup.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/middleware/auth.middleware.js'>auth.middleware.js</a></b></td>
							<td style='padding: 8px;'>- Implements authentication middleware to secure API endpoints by verifying JSON Web Tokens<br>- It ensures that only requests with valid tokens can access protected resources, maintaining user authentication state across the backend architecture<br>- This middleware is essential for safeguarding sensitive data and enforcing access control within the applications server-side logic.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- models Submodule -->
			<details>
				<summary><b>models</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.models</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/models/deviationOperations.model.js'>deviationOperations.model.js</a></b></td>
							<td style='padding: 8px;'>- Provides functionality to retrieve aggregated deviation data for specific transit lines and stops, focusing on deviations within a defined time window and weekday<br>- Facilitates analysis of punctuality patterns by grouping deviations per trip and vehicle, supporting operational insights and performance monitoring within the broader transportation management system.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/models/user.model.js'>user.model.js</a></b></td>
							<td style='padding: 8px;'>- Defines user-related data operations within the backend architecture, facilitating user account management and personalization features<br>- Handles creation, retrieval, and deletion of user information and favorite routes, integrating with the database to support user authentication, profile management, and route customization functionalities essential for a personalized user experience.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/models/deviationLogger.model.js'>deviationLogger.model.js</a></b></td>
							<td style='padding: 8px;'>- Provides functionality to log deviations related to trips, lines, stops, and vehicles into the database, capturing contextual data such as weekday and timestamp<br>- Serves as a core component for tracking operational anomalies within the backend architecture, enabling analysis and reporting of deviations to improve transit service reliability and performance monitoring.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/models/sdip.model.js'>sdip.model.js</a></b></td>
							<td style='padding: 8px;'>- Defines a deprecated data model related to public transportation, specifically for the SDIP system, and references a service for further data handling<br>- It categorizes vehicle types such as trams, buses, and trolleybuses, contributing to the overall architecture by supporting transportation data management and integration within the backend infrastructure.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/models/apiStatus.model.js'>apiStatus.model.js</a></b></td>
							<td style='padding: 8px;'>- Provides a health check endpoint for the backend API, enabling monitoring of service availability and responsiveness<br>- It returns the current operational status and timestamp, supporting system health assessments and ensuring reliable communication within the overall architecture<br>- This component plays a crucial role in maintaining system stability and facilitating proactive issue detection.</td>
						</tr>
					</table>
				</blockquote>
			</details>
      <details>
				<summary><b>services</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.services</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/services/deviationLogger.service.js'>deviationLogger.service.js</a></b></td>
							<td style='padding: 8px;'>- Provides functionality to log deviations of active vehicles by retrieving real-time vehicle data, processing deviation metrics, and storing normalized deviation records<br>- Integrates with external services to gather vehicle statuses and ensures deviations are accurately recorded for monitoring and analysis within the broader transportation management system<br>- Facilitates tracking vehicle adherence to schedules and operational performance.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/services/sdip.service.js'>sdip.service.js</a></b></td>
							<td style='padding: 8px;'>- Provides an interface to retrieve real-time transportation data from the SDIP system, including stops, departures, and vehicle statuses<br>- It integrates caching for efficiency and supports seamless data access for other services or frontend components, facilitating accurate and timely transit information within the overall architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- routes Submodule -->
			<details>
				<summary><b>routes</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.routes</b></code>
					<!-- api Submodule -->
					<details>
						<summary><b>api</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ backend.routes.api</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/routes/api/apiRouter.js'>apiRouter.js</a></b></td>
									<td style='padding: 8px;'>- Defines API routes for core backend functionalities, including deviation estimation, trip route searching, service status checks, and fetching transit stops<br>- Serves as a central hub connecting client requests to relevant controllers and services, facilitating seamless communication within the applications architecture and supporting features related to trip planning and transit data retrieval.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- users Submodule -->
					<details>
						<summary><b>users</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ backend.routes.users</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/routes/users/userRouter.js'>userRouter.js</a></b></td>
									<td style='padding: 8px;'>- Defines user-related API endpoints for managing favorite items, enabling authenticated users to add and retrieve their favorites<br>- Integrates route handling with authentication middleware to ensure secure access, serving as a key component in the user management architecture within the backend<br>- Facilitates seamless interaction between client requests and user data operations.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/Predsu/gzmtec/blob/master/backend/routes/users/authRouter.js'>authRouter.js</a></b></td>
									<td style='padding: 8px;'>- Defines authentication-related routes for user registration and login within the backend API, facilitating secure access control<br>- Integrates with user controllers to handle authentication logic and middleware for protected endpoints, contributing to the overall architecture by enabling user identity management and access security across the application.</td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>

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