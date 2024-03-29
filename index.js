import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/(.+?)$/, "$1"),
});
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// Corrected to directly use a new page for each request.
// If incognito mode is needed, uncomment the relevant lines.

app.use("/*", cors());

app.get("/*", async (c) => {
  const url = new URL(c.req.url);
  if (url.pathname === "/favicon.ico") {
    return c.text("");
  }
  const fetchUrl = url.pathname.replace(/^\//, "") + url.search;

  const page = await browser.newPage();

  await page.goto(fetchUrl);
  const a = await page.content();
  console.log(a);
  const content = await page.evaluate(() => {
    const pre = document.querySelector("pre");
    return pre ? pre.textContent : "{}";
  });
  await page.close(); // Close the page to free up resources.
  const json = JSON.parse(content);
  return c.json(json);
});

const port = process.argv[2] || 4000;

serve({
  fetch: app.fetch,
  port,
});

console.log("Proxy started on http://localhost:" + port);
