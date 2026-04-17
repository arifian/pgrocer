# Decisions

Running log of product/infra decisions for pgrocer. Each entry: what was decided, why, and what remains open.

---

## 2026-04-17 — Web GUI v1 foundation

### Domain
- **Decision**: **`pgrocer.pages.dev`** (Cloudflare Pages built-in subdomain).
- **Why**: Zero cost, HTTPS auto-provisioned, instantly available, no registrar to manage. Preview deploys get `<branch>.pgrocer.pages.dev` for free.
- **CF Pages project name**: `pgrocer`.
- **Future**: Add a custom domain (CNAME) anytime without redeploy if a real domain is purchased later.

### Hosting
- **Decision**: **Cloudflare Pages**.
- **Why**:
  - Unlimited bandwidth on free tier (vs GH Pages 100GB soft cap, S3+CF needs manual cert/bucket wiring).
  - Built-in preview deploys per PR.
  - Git-push-to-deploy, minimal setup.
  - Good opportunity to learn the CF Pages flow for future projects.
- **Not chosen**:
  - CloudFront → S3: more setup overhead than needed for a static POC.
  - GitHub Pages: fine but strictly inferior to CF Pages for same effort.
- **Open**: Repo connection, build command, and output directory configuration (depends on chosen static framework — likely Astro).

### Feedback channel
- **Decision**: **Google Form**, linked from the site (footer or small header button).
- **Why**: Zero backend, instant to set up, structured responses, familiar UX.
- **Open**: Form questions. Start minimal — free-text "what feedback?" + optional contact email.

### Monetization (v1)
- **Decision**: **None**. No ads, no donation prompts.
- **Why**: v1 priority is functionality + feedback loop. Project Gorgon audience is niche; AdSense RPM would not justify layout cost.
- **Future**: If interest warrants, add a **Ko-fi / Buy Me a Coffee** link over AdSense. Matches niche-gaming-tool norms better than display ads.

### Analytics (v1)
- **Decision**: Only Cloudflare Pages' built-in web analytics (privacy-friendly, cookieless, free). No GA, no third-party trackers.
- **Why**: Enough signal to gauge traffic without adding cookie banners / GDPR exposure.

---

## Deferred / open questions

- Web framework (Astro vs plain Vite vs Next.js static export). Leaning Astro.
- Character JSON ingestion: file upload UI (client-side only — no data leaves the browser). Privacy claim to display prominently.
- Multi-skill UX: tabs, dropdown, or combined view.
- Wiki data refresh: build-time scrape vs scheduled GitHub Action committing updated cache.
- Donation page timing (post-feedback-signal).
