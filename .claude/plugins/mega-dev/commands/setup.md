---
description: Set up the mega-ulgurji project for local development
allowed-tools: Bash, Read
---

Set up the MegaHome Ulgurji e-commerce project for local development:

1. Check if dependencies are installed:
   - Run `ls node_modules/.package-lock.json` to verify
   - If not, run `npm install`

2. Verify the project builds:
   - Run `npm run build` and report any errors

3. Check environment setup:
   - Verify `firebase/config.ts` has valid Firebase config
   - Check if `.env.local` exists (needed for API routes)
   - If missing, warn about email credentials in `app/api/sendOrderEmail/route.ts`

4. Start the development server:
   - Run `npm run dev`
   - Report the local URL (usually http://localhost:3000)

5. Summarize project status:
   - List any build warnings or errors
   - Note any missing environment variables
   - Confirm Firebase project connectivity
