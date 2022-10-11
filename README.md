# PomfretMobile API
## v2.0.0

This repository serves as the API for Pomfret Mobile, handling generations for both iOS and Android devices.

## v2 Updates
Version 2 features a brand new re-write of the frontend and backend. Overall stability of the application has been improved, along with a refreshed UI and support for new features.

- Client and Server-side support for Google SSO authentication
- Added support for Android devices via Google Wallet
- Migrated database from mongoDB to Postgres
- Improved role management

## Disclaimer
This API is intended to work with a properly configured front-end site. Most raw requests (i.e. through the browser or Postman) will fail without further configuration. For a configured front-end, see the PomfretMobile Next.js website.

## Installation

This API requires [Node.js](https://nodejs.org/), and yarn, and TypeScript installed on your computer to run.

For Development:

```sh
git clone https://...
cd PomfretMobileApi
yarn install
yarn start
```

Environment variables are required to run this application. Start by creating a `.env` file in the project root directory.
Insert the following values into your `.env` file.

```
//For DB Connection
DATABASE_URL='postgres://your-credentials'
//Random 128-bit client secret- run openssl rand -hex 128 to generate
AUTHORIZED_CLIENT_SECRET='secret'
//Google Pay Issuer ID
GPAY_ISSUER_ID=0000000
```

For production environments...

```sh
git clone https://...
cd PomfretMobileApi
yarn install
yarn deploy
```

## Authentication/Authorization

By default, authentication is enabled on this API. 
To disable it for development purposes, navigate to `index.ts`.
Comment out the line `app.use(auth)`, this turns off authentication.

When authentication is enabled, all users must pass in a `session` token, and a `clientID`.
Additionally, when accessing generator endpoints, the request must contain a `callbackUri`.

### Authentication Requests
| Header | Value | Type |
| ------ | ------ | ------ |
| Authorization | `session` | String |
| x_cle_cdf | `clientID` | String |

### Generation Requests
In addition to the above headers for authentication, generation requests must additionally contain the following headers
| Header | Value | Type |
| ------ | ------ | ------ |
| Referer | `callbackUri` | String (URL) |


## Frameworks

This application relies on the following frameworks:

- Express (API handling and routing)
- TypeScript (programming language)
- passkit-generator (iOS generation API).
- google-auth-library (Android generation API plugin)
- jsonwebtoken (signing for Android passes)



## Future Development

This application may be improved in the near future, including support for an online/mobile schedule. 
If there are any suggestions that anyone may have as to this project, they are much appreciated.
