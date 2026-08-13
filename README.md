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
| `index.html` | Home (hero, features, screenshots, free check-in, pricing, safety) |
| `features.html` | Full feature catalogue — 12 quick tools, 18 screeners, insights |
| `bandura.html` | The AI companion, including its honest limits |
| `therapy.html` | Using Mind Matter alongside therapy; a section for clinicians |
| `check-in.html` | Free PHQ-9 / GAD-7 self-screeners (see safety note below) |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `safety.html` | Health & Safety Disclaimer |
| `style.css` | Shared stylesheet for every page |
| `site.js` | Sticky-nav border + scroll reveal. Pages are fully readable without it. |
| `checkin.js` | Screener logic. Runs entirely in the browser; nothing stored or sent. |
| `shots/` | App screenshots, cropped from the App Store marketing assets |
| `social/` | Ready-to-post Instagram graphics (1080×1350, ×1920 story, ×1080 square) |
| `logo.png` | App icon |

## The free check-in — read before editing

`check-in.html` + `checkin.js` serve real clinical instruments to the public, so
two rules are load-bearing:

1. **PHQ-9 item 9 asks about thoughts of self-harm.** Any non-zero answer shows
   crisis resources *above* the score, regardless of the total. A low total with
   a positive item 9 is exactly the case a naive sum would bury — do not make the
   crisis panel conditional on the score.
2. **Nothing is stored or transmitted.** No account, no email capture, no
   analytics, no `fetch`. Answers live in a local variable and die with the tab.
   Keep it that way; it is a promise made on the page itself.

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
