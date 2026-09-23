import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
if (
  !(await page.getByRole("heading", { name: "Heritage, reimagined." }).count())
)
  throw new Error("Hero not rendered");
await page.goto("http://localhost:3000/shop?category=Women");
await page.getByRole("heading", { name: "Crimson Chikankari Suit" }).click();
await page.getByRole("button", { name: "M", exact: true }).click();
await page.getByRole("button", { name: "Add to bag" }).click();
await page.goto("http://localhost:3000/cart");
await page
  .getByRole("button", { name: "Increase Crimson Chikankari Suit quantity" })
  .click();
await page.getByRole("link", { name: "Continue to checkout" }).click();
await page.getByRole("heading", { name: "Almost yours." }).waitFor();
await page.locator("input[name=email]").fill("test@example.com");
await page.locator("input[name=name]").fill("Test Customer");
await page.locator("input[name=phone]").fill("03001234567");
await page.locator("input[name=line1]").fill("123 Main Street");
await page.locator("input[name=city]").fill("Lahore");
await page.locator("input[name=postalCode]").fill("54000");
await page.getByRole("button", { name: "Place order" }).click();
await page.getByRole("alert").filter({ hasText: "catalog preview" }).waitFor();
await page.goto("http://localhost:3000/admin");
await page.waitForURL("**/login");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
if (
  await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
)
  throw new Error("Mobile horizontal overflow");
await page.getByRole("button", { name: "Open menu" }).click();
await page
  .getByRole("navigation", { name: "Main navigation" })
  .getByRole("link", { name: "Women", exact: true })
  .click();
await page.getByRole("heading", { name: "Women", exact: true }).waitFor();
await page.screenshot({ path: "artifacts/shop-mobile.png", fullPage: true });
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: desktop/mobile render, category filter, product selection, cart quantity, checkout preview guard, admin protection, mobile navigation; no browser runtime errors.",
);
await browser.close();
