## About

A local http proxy to bypass CORS / Cloudflare using Hono and Playwright.

## Usage

Run

```sh
npm install
npx playwright install chrome
node index.js
```

By default the proxy is started at http://localhost:4000

You can proxy an URL https://example.com as:

```
http://localhost:4000/https://example.com
```

**Note**: The proxy expects a JSON response.

## Options

Optionally you can specify a port number as an argument:

```sh
node index.js 4001
```
