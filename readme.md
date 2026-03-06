# Deploying to Netlify — Step-by-Step

This folder contains a standalone static website optimized for **Netlify**. It includes a landing page, a scroll-snap diary viewer, and a submission form that works without a database.

### �️ Mandatory Setup (Do this once!)
Netlify sometimes needs to be told to look for forms.
1.  Go to your **Site Dashboard** in Netlify.
2.  Click on **Site Settings** -> **Build & deploy** -> **Post-processing**.
3.  Scroll down to **Forms** and ensure **Form detection** is **Enabled**. (If you see an "Enable" button, click it!)

## �🚀 How to Deploy (The "Drag and Drop" Method)
Netlify is completely free for sites like this. 

1.  **Login/Sign Up**: Go to [app.netlify.com](https://app.netlify.com/) and log in.
2.  **Go to Sites**: Click on the **"Sites"** tab.
3.  **Upload**: Look for the "Drag and drop your site folder here" box.
4.  **Drag and Drop**: Drag the **folder** `my-static-site` into that box.
5.  **Done!**: Netlify will give you a live URL.

### � How to Update (Recommended)
Instead of deleting the site, update it to keep your settings:
1.  Go to your **Site Dashboard** in Netlify.
2.  Click on the **"Deploys"** tab (at the top).
3.  Scroll to the very bottom to the box that says **"Need to update your site? Drag and drop..."**.
4.  Drag your folder there. This keeps your "Form Detection" settings active.

### 🗑️ How to Delete (If Needed)
If you really want to start over:
1.  Go to **Site Settings** -> **General** -> **Danger Zone**.
2.  Click **Delete this site**.
3.  **Note**: If you create a new site, you MUST do the "Mandatory Setup" at the top again!

---

## 📝 How the Diary Form Works

Your site is pre-configured with **Netlify Forms**. You don't need to set up anything else!

*   **Submissions**: When someone fills out the form on your `submit.html` page, they will see your custom success page.
*   **Managing Entries**: Log in to Netlify, click on your site, and go to the **"Forms"** tab. You will see every diary entry submitted by your users right there.
*   **Updating the Site**: Since this is a static site, you can manually add the best submissions into the `diary.html` file by copying the entry blocks.

---

## 🎨 How to Customize

*   **Images**: All graphics are in the `assets/` folder. You can replace them with your own SVGs (keep the same filenames to avoid editing code).
*   **Logos**: Replace `logo-brand.svg` (header) and `logo-hero.svg` (landing) to change the branding.
*   **New Entries**: To add a new entry to the diary page, open `diary.html` and copy one of the `<div class="diary-entry">` blocks.

---

## 🔗 Site Links
- **Landing Page**: `index.html` (Home)
- **Diary Viewer**: `diary.html`
- **Submission Form**: `submit.html`
