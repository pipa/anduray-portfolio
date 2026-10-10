import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const widths = [375, 768, 1280, 1920];
const url = process.env.SITE_URL || "http://127.0.0.1:4173/concepts/composer/index.html";
const outDir = path.join(dir, "stills");
const round = process.env.ROUND || "1";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(async () => {
  const step = window.innerHeight * 0.85;
  const max = document.body.scrollHeight;
  for (let y = 0; y < max; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => setTimeout(r, 400));
  window.scrollTo(0, 0);
});
await page.evaluate(() =>
  Promise.all(
    [...document.images].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  )
);
await page.waitForTimeout(400);

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, `round-${round}-${w}.png`),
    fullPage: true,
  });
}

await browser.close();
console.log(`Saved round ${round} stills to ${outDir}`);
