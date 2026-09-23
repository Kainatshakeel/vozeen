# Verification

Verified in the supplied Windows workspace:

- `npm run build`: production compilation, TypeScript and prerendering passed.
- `npm run test`: 7 commerce/security unit tests passed.
- `npm audit`: 0 known vulnerabilities after overriding the vulnerable transitive `deepmerge-ts` package with v8. Prisma generation and the full build pass with this override.
- `node scripts/browser-check.mjs`: headless Chromium desktop (1440px) and mobile (390px) flows passed. Checked home render, category navigation, product size selection, add-to-bag, quantity change, checkout form, preview-mode order protection, admin redirect, and mobile menu. No browser runtime errors or mobile horizontal overflow were detected.
- Browser screenshots are available in `artifacts/` (generated, excluded from source control).

Not verified: live PostgreSQL persistence, concurrency against a running database, real customer authentication with database accounts, gateway sandbox acceptance and production callbacks. No PostgreSQL/Docker runtime or merchant credentials were supplied. These need an integration environment before launch.

Start the server before `npm run test:browser`. The browser test expects catalog preview mode, without `DATABASE_URL`, and intentionally verifies that checkout cannot create a fake order. Run `npx playwright install chromium` once if the browser is missing.
