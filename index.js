import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chromium, devices } from "playwright";

const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/(.+?)$/, "$1"),
});
const browser = await chromium.launch({ headless: true });
const chrome = devices["Desktop Chrome"];
const context = await browser.newContext(chrome);

app.use("/*", cors());

app.get("/*", async (c) => {
  const url = new URL(c.req.url);
  if (url.pathname === "/favicon.ico") {
    return c.text("");
  }
  const fetchUrl = url.pathname.replace(/^\//, "") + url.search;
  const page = await context.newPage();
  await page.goto(fetchUrl);
  const content = await page.evaluate(() => {
    const pre = document.querySelector("pre");
    return pre ? pre.textContent : "{}";
  });
  const json = JSON.parse(content);
  return c.json(json);
});

const port = process.argv[2] || 4000;

serve({
  fetch: app.fetch,
  port,
});

console.log("Proxy started on http://localhost:" + port);
