# Mind Matter — marketing website

The public website for **mindmattermentalhealth.com**. Completely separate from the
Mind Matter iPhone app repo (`mindmatter/`) — different project, different Vercel
deployment, no shared code or config.

Plain static HTML/CSS. No build step, no framework, no dependencies. That is
deliberate: Google's OAuth brand verification and other crawlers read the raw HTML
without executing JavaScript, and the app's React site served them an empty page.

## Files

| File | What it is |
|---|---|
| `index.html` | The marketing page (hero, features, screenshots, pricing, safety) |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `safety.html` | Health & Safety Disclaimer |
| `style.css` | Shared stylesheet for all four pages |
| `site.js` | Sticky-nav border + scroll reveal. Page is fully readable without it. |
| `shots/` | App screenshots, cropped from the App Store marketing assets |
| `logo.png` | App icon |

## Preview locally

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>.

## Deploy

New Vercel project pointed at this repo. No framework preset, no build command —
it is a static directory. Then attach `mindmattermentalhealth.com` to **this**
project (and remove it from the app project, which currently holds it).

## Things to update later

- **App Store link.** Two `<a>` tags in `index.html` say "Coming soon" and are
  marked with an HTML comment. Swap in the real App Store URL and change the
  label once the listing is approved.
- **Pricing.** `$89.99/year` and `$9.99/month` with a 3-day trial are hard-coded
  in the pricing section of `index.html`. Keep them in sync with App Store Connect.
- **Legal text.** These pages are a copy of the in-app legal pages
  (`mindmatter/src/pages/Legal.js`). If you change one, change the other — they
  are not shared. The privacy policy here has one extra disclosure the in-app
  version does not: the Google/Apple sign-in paragraph in Section 1, added
  because Google requires apps to disclose how they handle Google user data.
