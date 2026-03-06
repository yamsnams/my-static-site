================================================================================
 SITE README — My Static Site
 Last Updated: March 2026
================================================================================

OVERVIEW
--------
A minimalist, illustration-driven static site built with plain HTML, CSS, and
JavaScript. No frameworks, no build tools, no backend — just files. Hosted on
Cloudflare Pages with GitHub API-powered content management via a custom admin
panel. Authentication is handled by Cloudflare Access (free, zero-config).


--------------------------------------------------------------------------------
SITE STRUCTURE
--------------------------------------------------------------------------------

my-static-site/
│
├── index.html          → Landing page (hero, illustrations, diary CTA)
├── diary.html          → Scroll-snap diary entries page
├── submit.html         → Visitor diary submission form
├── success.html        → Post-submission success page
│
├── admin/
│   ├── index.html      → Admin dashboard (protected by Cloudflare Access)
│   └── login.html      → Redirect shim (unused — Cloudflare handles login)
│
├── data/
│   ├── entries.json    → All diary entries (managed via admin panel)
│   └── settings.json   → Site-wide settings (titles, footer, social links)
│
├── js/
│   └── main.js         → Fetches + applies settings.json and entries.json
│
├── css/
│   └── style.css       → All site styles
│
├── assets/             → SVG logos, icons, and illustrations
└── fonts/              → Custom font files (.ttf)


--------------------------------------------------------------------------------
PAGE FUNCTIONALITY
--------------------------------------------------------------------------------

1. INDEX.HTML — Landing Page
   - Shows brand logo, hero ornament, corner illustrations
   - "diary ↓" button links to diary.html
   - Social links and footer are dynamically populated from settings.json
   - Site title and footer text are also controlled via settings.json

2. DIARY.HTML — Diary Entries
   - Full-screen scroll-snap layout — one entry per 100vh slide
   - Each entry shows: illustration image, text (max 200 words), author name
   - Navigation dots on the right: only 3 dots shown at a time (prev/current/next)
   - Keyboard navigation: Arrow Up/Down or Arrow Left/Right
   - Entries are fetched dynamically from data/entries.json
   - "Submit your entry" button in header links to submit.html

6. SUBMIT.HTML — Submission Form
   - Visitors can submit their own diary entries
   - Setup is 100% serverless and private
   - Submissions open the user's default email app (mailto: link)
   - You receive submissions directly to your email inbox

4. SUCCESS.HTML — Success Page
   - Shown after a form submission
   - Links back to the diary and home page

5. ADMIN/INDEX.HTML — Admin Dashboard
   - Protected by built-in GitHub Personal Access Token (PAT) login
   - Sections:
     a) Overview      → Stats: entry count, pages, quick navigation
     b) Diary Entries → Add, edit, delete entries — auto-saves to GitHub
     c) Form Submissions → Links to Cloudflare/Netlify Forms dashboard
     d) Page Content  → Edit site title, hero/diary/submit page titles,
                        footer copyright, terms link, social links
     e) Analytics     → Connect GoatCounter for embedded traffic stats
     f) Site Settings → Connect GitHub for auto-save; fallback download


--------------------------------------------------------------------------------
DATA FILES
--------------------------------------------------------------------------------

data/entries.json — format:
{
  "entries": [
    {
      "author": "Name or Anonymous",
      "date": "2026-03-01",
      "text": "The diary entry text (up to 200 words shown).",
      "image": "assets/illustration-left.svg"
    }
  ]
}

data/settings.json — format:
{
  "site_title": "Your Brand",
  "hero_title": "Your Brand — Landing",
  "diary_title": "Your Brand — Diary",
  "submit_title": "Your Brand — Submit",
  "footer_copy": "© 2026 Your Brand",
  "terms_link": "https://...",
  "terms_label": "Terms and Policies",
  "social_links": [
    { "name": "Instagram", "icon": "assets/icon-social-1.svg", "url": "https://..." }
  ]
}


--------------------------------------------------------------------------------
ADMIN PANEL — GITHUB AUTO-SAVE SETUP (One-Time)
--------------------------------------------------------------------------------

The admin panel saves changes directly to GitHub from your browser.
No backend or server configuration is required!

Steps to set up:

1. GET YOUR GITHUB TOKEN:
   a) Go to github.com → Settings → Developer Settings
      → Personal Access Tokens → Tokens (Classic)
   b) Click "Generate new token (classic)"
   c) Give it a note (e.g. "Site Admin"), set expiry, check the "repo" scope
   d) Copy the token (save it safely)

2. CONFIGURE ADMIN PANEL:
   a) Open your admin panel → Site Settings.
   b) Enter: GitHub Token, username (Owner), Repository name, and Branch (main).
   c) Click **"Connect & Run Diagnostics"**.

3. ASSET MANAGEMENT:
   - Use the **Assets tab** to upload illustrations (SVGs/Images) to your repo.
   - These assets will automatically appear in a dropdown when you create or 
     edit diary entries.

4. AUTOMATED SUBMISSIONS:
   - Public submissions now go to your Admin Panel for review.
   - **IMPORTANT:** You MUST add your GitHub details to the Cloudflare 
     Dashboard (Settings → Environment Variables) for the API to work:
     - `GH_TOKEN`: Your Personal Access Token (with repo scope)
     - `GH_OWNER`: Your GitHub username
     - `GH_REPO`: Your repository name
   - Once set, refresh your Admin Submissions tab to approve new entries.

After this, every diary save, edit, delete, asset upload, and visitor 
submission will be handled directly in your beautiful new Admin Panel!
Cloudflare Pages deploys changes in ~30s.


--------------------------------------------------------------------------------
AUTHENTICATION — ADMIN ACCESS
--------------------------------------------------------------------------------

The admin panel is protected by your Cloudflare Access or a simple redirect.
Since the "Save" logic is now on the backend, unauthorized users cannot 
push changes to your repository even if they bypass the UI.

Steps to get your token:
1. Go to github.com → Settings → Developer Settings
   → Personal Access Tokens → Tokens (Classic)
2. Click "Generate new token (classic)"
3. Give it a note (e.g. "Site Admin"), set expiry, check the "repo" scope
4. Copy the token (you won't see it again)
5. Paste it into the login page at [your-site].pages.dev/admin/


--------------------------------------------------------------------------------
ANALYTICS — GOATCOUNTER SETUP (Optional, Free)
--------------------------------------------------------------------------------

GoatCounter is a free, privacy-first analytics tool.

1. Create a free account at https://goatcounter.com
2. Add your site — you'll get a site code (e.g. "mysite")
3. Open Admin → Analytics, enter your site code, click "Connect"
4. Add this snippet to the <head> of every HTML page:

   <script data-goatcounter="https://YOUR_CODE.goatcounter.com/count"
           async src="//gc.zgo.at/count.js"></script>

Replace YOUR_CODE with your GoatCounter site code.


--------------------------------------------------------------------------------
DEPLOYING TO CLOUDFLARE PAGES — STEP BY STEP
--------------------------------------------------------------------------------

PREREQUISITES:
  - A GitHub account with your site repository uploaded
  - A Cloudflare account (free at cloudflare.com)

STEP 1: Log in to Cloudflare
  → Go to dash.cloudflare.com and sign in (or create a free account)

STEP 2: Create a Pages Project
  → In the left sidebar, click "Workers & Pages"
  → Click "Create" → "Pages" tab → "Connect to Git"

STEP 3: Connect GitHub
  → Click "Connect GitHub"
  → Authorize Cloudflare to access your GitHub account
  → Select your repository from the list
  → Click "Begin setup"

STEP 4: Configure Build Settings
  → Framework preset: None
  → Build command: (leave completely empty)
  → Build output directory: / (forward slash only)
  → Root directory: / (forward slash only)
  → Click "Save and Deploy"

STEP 5: Wait for Deployment
  → Cloudflare will deploy your site in about 60 seconds
  → You'll get a live URL like: https://my-static-site-abc.pages.dev

STEP 6: Set Up GitHub Auto-Save in Admin Panel
  → See "ADMIN PANEL — GITHUB AUTO-SAVE SETUP" section above

STEP 8 (Optional): Add a Custom Domain
  → In your Pages project → Custom Domains → Add a domain
  → Follow the DNS instructions


--------------------------------------------------------------------------------
UPDATING CONTENT (After Cloudflare Pages is Live)
--------------------------------------------------------------------------------

To update diary entries or site settings:
1. Go to https://[your-site].pages.dev/admin/
2. Enter your GitHub Personal Access Token on the login page
3. Make your changes in the admin panel
4. The admin panel auto-saves directly to GitHub
5. Cloudflare Pages redeploys automatically in ~30 seconds
6. Done — no local tools, no terminal, no commits needed!


--------------------------------------------------------------------------------
FONTS
--------------------------------------------------------------------------------

The site uses two custom fonts stored in /fonts/:
  - homemadeapple.ttf  → Used for body text (handwritten feel)
  - coalhandluke.ttf   → Used for headers, buttons, and labels

To replace fonts: swap the .ttf files and update the @font-face rules in
css/style.css (lines 47-61).


--------------------------------------------------------------------------------
CUSTOMIZING ASSETS
--------------------------------------------------------------------------------

All assets are in /assets/ as SVG files:
  - logo-brand.svg         → Brand logo in header
  - logo-hero.svg          → Large hero center logo
  - icon-home.svg          → Home icon in header
  - ornament-hanging.svg   → Hanging ornament above hero logo
  - illustration-left.svg  → Left corner illustration (also used in diary)
  - illustration-right.svg → Right corner illustration
  - icon-social-1.svg      → First social link icon
  - icon-social-2.svg      → Second social link icon

Replace any of these SVG files with your own to update branding.
Social link URLs are controlled via Admin → Page Content → Social Links.


================================================================================
END OF README
================================================================================
