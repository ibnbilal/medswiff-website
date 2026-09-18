# MedSwiff — Marketing Site

Static site, no build step. Three files: `index.html`, `styles.css`, `script.js`.

## Run locally
Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Deploy to GitHub + Cloudflare Pages
1. Push these three files to a GitHub repo (root of the repo, or a folder like `/site` — your call).
2. In Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave blank)
   - **Build output directory:** `/` (or your folder, e.g. `/site`)
4. Deploy. Cloudflare will give you a `*.pages.dev` URL immediately; add a custom domain afterward under the project's **Custom domains** tab.

## Notes
- Fonts load from Google Fonts CDN (`fonts.googleapis.com` / `fonts.gstatic.com`) — no local font files needed.
- No backend: the demo form validates client-side and shows a success state, but doesn't send data anywhere yet. Wire `script.js`'s submit handler up to your form service (e.g. a Cloudflare Pages Function, Formspree, etc.) when ready.
- No fabricated stats, testimonials, or compliance claims are in the copy — keep it that way if you extend content.
