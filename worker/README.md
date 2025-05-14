# Database and API

[Cloudflare Worker](https://developers.cloudflare.com/workers/) with [Cloudflare D1](https://developers.cloudflare.com/d1/) allows the API to scale with low maintenance, low latency and high availability.

## Todo

- [x] Define all endpoints
- [ ] Implement all query params for each endpoint according to Namestone docs
  - [x] Set Name
  - [x] Get Names
  - [x] Search Names
  - [x] Delete Name
  - [x] Set Domain
  - [x] Get Domain
  - [ ] Enable Domain
  - [x] Get SIWE Message
- [ ] Add API key verification
- [ ] Add network support

## API Routes

| Method | Path                | Description                                                                    |
| ------ | ------------------- | ------------------------------------------------------------------------------ |
| GET    | `/get-domain`       | Fetches the records for a domain.                                              |
| GET    | `/get-names`        | Returns a list of subdomains associated with a specific domain and/or address. |
| GET    | `/get-siwe-message` | Returns a SIWE Message that users sign for authentication purposes.            |
| GET    | `/health`           | Returns a 200 status if the API is available.                                  |
| GET    | `/search-names`     | Returns all subdomains for a domain that start with a string.                  |
| POST   | `/delete-name`      | Deletes a subdomain.                                                           |
| POST   | `/enable-domain`    | Creates an API key to issue subdomains for a domain.                           |
| POST   | `/set-domain`       | Sets records for a parent domain that is already enabled in NameStone.         |
| POST   | `/set-name`         | Creates a subdomain. If the name already exists, it will be overwritten.       |

See https://namestone.com/docs/api-routes for more details.

## Run Locally

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `npx wrangler login`
3. Create a D1 instance: `npx wrangler d1 create <DATABASE_NAME> --location=enam` and update the `[[d1_databases]]` section of `wrangler.toml` with the returned info
4. Create the default table in the local database: `bun run dev:create-tables`
5. Install dependencies: `bun install`
6. Start the dev server: `bun dev`

## Deploy to Cloudflare

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `npx wrangler login`
3. Deploy the Worker: `bun run deploy`
4. Create the default table in the prod database: `bun run prod:create-tables`
