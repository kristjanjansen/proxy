## About

A local http proxy to bypass CORS / Cloudflare using Hono and Puppeteer.

## Usage

Make sure you have Chrome installed. Then run:

```sh
npm install
npm run start
```

By default the proxy is started at http://localhost:4000

You can proxy an URL https://example.com as:

```
http://localhost:4000/https://example.com
```

## Options

For Docker usage, use the following setup:

```sh
npm run start 8080 /usr/bin/google-chrome
```
