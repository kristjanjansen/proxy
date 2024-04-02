import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const port = process.argv[2] || 4000;

const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/(.+?)$/, "$1"),
});
const browser = await puppeteer.launch({
  executablePath: process.argv[3],
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// Corrected to directly use a new page for each request.
// If incognito mode is needed, uncomment the relevant lines.

app.use("/*", cors());

app.get("/*", async (c) => {
  const url = new URL(c.req.url);

  const rewrite = `${url.hostname == "localhost" ? "http" : "https"}://${
    url.host
  }`;
  console.log(rewrite);

  if (url.pathname === "/favicon.ico") {
    return c.text("");
  }
  const fetchUrl = url.pathname.replace(/^\//, "") + url.search;

  const contentType = (filename) => {
    if (filename.endsWith("css")) {
      return "css";
    }
    if (filename.endsWith("js")) {
      return "js";
    }
    if (filename.endsWith("svg")) {
      return "svg";
    }
  };

  if (["css", "js", "svg"].includes(contentType(fetchUrl))) {
    const res = await fetch(fetchUrl).then((res) => res.text());
    const rewrittenRes = res.replace(
      '"/6g-api"',
      `"${rewrite}/https://www.energia.ee/6g-api"`
    );
    const contentTypes = {
      css: "text/css",
      js: "application/javascript",
      svg: "image/svg+xml",
    };
    return c.body(rewrittenRes, 200, {
      "Content-Type": contentTypes[contentType(fetchUrl)],
    });
  }

  const page = await browser.newPage();

  await page.goto(fetchUrl);
  const a = await page.content();
  const content = await page.evaluate(() => {
    const pres = document.querySelectorAll("pre");
    if (pres?.length === 1) {
      return { json: JSON.parse(pres[0].textContent) };
    }
    const body = document.querySelector("body");
    return { text: body.textContent };
  });
  await page.close();
  if (content.json) {
    return c.json(content.json);
  }
  if (content.text) {
    return c.text(content.text);
  }
  return c.text("");
});

serve({
  fetch: app.fetch,
  port,
});

console.log("Proxy started on http://localhost:" + port);
