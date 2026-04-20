# DEPLOY — No Terminal Required
## GitHub Desktop + Vercel web UI

---

## WHAT YOU NEED
- GitHub account (you have this)
- Vercel account connected to GitHub (you have this)
- GitHub Desktop — free download at desktop.github.com
- The unzipped visibility-os project folder

---

## STEP 1 — UNZIP THE PROJECT
Double-click `visibility-os-deploy.tar.gz` on Mac (extracts automatically).
On Windows: right-click → Extract All.

You should see a folder called `visibility-os` with files inside:
index.html, package.json, vercel.json, src/, public/, etc.

---

## STEP 2 — INSTALL GITHUB DESKTOP
Go to desktop.github.com → download → install → sign in with your GitHub account.

---

## STEP 3 — CREATE A NEW REPO ON GITHUB.COM
1. github.com → click + → New repository
2. Name it: visibility-os
3. Set to Private
4. Do NOT check "Add a README"
5. Click Create repository

---

## STEP 4 — CLONE THE EMPTY REPO IN GITHUB DESKTOP
1. GitHub Desktop → File → Clone Repository
2. Click the GitHub.com tab
3. Find visibility-os → click Clone
4. Note where it saves the folder on your computer

---

## STEP 5 — COPY YOUR PROJECT FILES IN
1. Open Finder (Mac) or File Explorer (Windows)
2. Open the unzipped project folder from Step 1
3. Select all files inside (Cmd+A / Ctrl+A)
4. Copy (Cmd+C / Ctrl+C)
5. Navigate to the cloned folder from Step 4
6. Paste everything in (Cmd+V / Ctrl+V)

---

## STEP 6 — COMMIT AND PUSH IN GITHUB DESKTOP
1. GitHub Desktop will show all the new files on the left
2. In the Summary box (bottom left) type: Initial commit
3. Click Commit to main
4. Click Push origin (blue button at top)

Check github.com/your-username/visibility-os — you should see all files there.

---

## STEP 7 — DEPLOY ON VERCEL (you know this part)
1. vercel.com → Add New Project
2. Import visibility-os from your GitHub list
3. Vercel auto-detects Vite — settings should already be correct
4. Click Deploy

Live in ~60 seconds at visibility-os-yourusername.vercel.app

---

## FUTURE UPDATES
Make file changes → GitHub Desktop shows them → write a commit message →
Commit to main → Push origin → Vercel auto-redeploys. Done.

---

## COMMON ISSUES

Can't find the cloned folder:
GitHub Desktop → Repository menu → Show in Finder / Show in Explorer

Hidden files not copying on Mac:
Press Cmd+Shift+. before copying to show hidden files (like .gitignore)

Generate button not working:
Click "Connect API Key" in the sidebar. Get a key at console.anthropic.com.
