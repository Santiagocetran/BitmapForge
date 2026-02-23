# Deployment

Guide for deploying BitmapForge to Vercel with automatic deploys and a custom domain.

---

## Why Vercel

BitmapForge is a client-side SPA (no backend). Vercel is the best fit because:

- **Zero config for Vite** — Vercel auto-detects the framework and runs `npm run build`
- **Preview deploys per PR** — Every PR gets a unique live URL. Reviewers can test changes without cloning the repo. This is critical for an open-source project.
- **Auto-deploy on merge** — Push to `main` → production updates automatically
- **Free Hobby tier** — Sufficient for an open-source project (100 GB bandwidth/month, unlimited deploys)
- **Custom domain support** — Easy DNS configuration

---

## Initial Setup

### 1. Create Vercel account

Go to [vercel.com](https://vercel.com) and sign up with your GitHub account. This links Vercel to your GitHub repos.

### 2. Import the repository

1. From the Vercel dashboard, click **"Add New Project"**
2. Select the `Santiagocetran/BitmapForge` repository
3. Vercel auto-detects Vite. The default settings should be:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**

That's it. Your app is live at `bitmapforge.vercel.app` (or similar).

### 3. No Vite config changes needed

The current `vite.config.js` works as-is with Vercel. You do NOT need to set a `base` URL — Vercel serves from the root.

If you ever need environment variables (for v2 with Supabase), you'd add them in the Vercel dashboard under Project Settings > Environment Variables.

---

## Preview Deploys (PR Previews)

This works automatically once the repo is connected to Vercel:

1. A contributor opens a PR
2. Vercel builds that PR's branch and deploys it to a unique URL like `bitmapforge-git-feature-branch-santiagocetran.vercel.app`
3. Vercel posts a comment on the PR with the preview URL
4. Reviewers click the link and test the changes live
5. When the PR is updated, the preview re-deploys automatically

**No configuration needed.** This is enabled by default for all Vercel projects connected to GitHub.

### Preview deploy + CI pipeline together

With the GitHub Actions CI from `CICD_AND_OPENSOURCE.md`, every PR now has:
- CI checks: lint, format, tests, build (must all pass)
- Live preview URL from Vercel (for visual/manual testing)

Both appear as status checks on the PR. You can require both to pass before merging.

---

## Custom Domain

### 1. Add domain in Vercel

1. Go to your project in the Vercel dashboard
2. Settings > Domains
3. Enter your domain (e.g., `bitmapforge.com`)
4. Vercel shows you the DNS records to add

### 2. Configure DNS

At your domain registrar (wherever you bought the domain), add these records:

**For apex domain (`bitmapforge.com`):**

| Type | Name | Value |
|---|---|---|
| A | @ | `76.76.21.21` |

**For www subdomain (`www.bitmapforge.com`):**

| Type | Name | Value |
|---|---|---|
| CNAME | www | `cname.vercel-dns.com` |

Vercel automatically:
- Provisions a free SSL certificate (HTTPS)
- Redirects `www` to the apex domain (or vice versa, your choice)
- Handles certificate renewal

DNS propagation can take up to 48 hours, but usually completes within minutes.

### 3. Verify

After DNS propagates, Vercel shows a green checkmark next to your domain in the dashboard. Your app is now live at `https://bitmapforge.com`.

---

## Production Build Optimization

The current build outputs everything into a single JS bundle. For a better production experience, consider these optional improvements:

### SPA routing fallback

Since BitmapForge is a single-page app with no client-side router, this isn't needed yet. But if you add routes later, create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Clean up dist/ from git

The `dist/` folder is currently committed to the repo (including two test 3D models: `router-prueba.glb` and `sai-prueba-pagina.stl`). Since Vercel builds fresh from source, `dist/` should be gitignored:

1. Add `dist/` to `.gitignore` (it may already be there but was force-added)
2. Remove it from git tracking: `git rm -r --cached dist/`
3. Commit

---

## Deployment Workflow Summary

```
Contributor opens PR
  ├── GitHub Actions CI runs: lint → format check → tests → build
  └── Vercel builds preview deploy → posts URL on PR

Both checks pass → PR is mergeable

Maintainer merges PR to main
  └── Vercel auto-deploys to production (bitmapforge.com)
```

No manual deployment steps. No SSH. No Docker. No server to maintain.

---

## Cost

Vercel Hobby plan (free):
- Unlimited personal projects
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deploys
- Serverless functions (not needed now, useful for v2)

This is more than enough for BitmapForge. You'd only need the Pro plan ($20/month) if you add team members to the Vercel project or exceed bandwidth — unlikely for an open-source tool.
