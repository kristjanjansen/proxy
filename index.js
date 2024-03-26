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

const port = 8080;

serve({
  fetch: app.fetch,
  port,
});
