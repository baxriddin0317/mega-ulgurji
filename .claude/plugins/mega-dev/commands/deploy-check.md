---
description: Pre-deployment checklist and Vercel deployment status check
allowed-tools: Bash, Read, Grep, Glob
---

Run pre-deployment checks for MegaHome Ulgurji:

1. **Build Check**: Run `npm run build` - must pass cleanly
2. **Lint Check**: Run `npm run lint` - no errors allowed
3. **Type Check**: Verify no TypeScript errors in build output
4. **Security Check**:
   - No hardcoded credentials (except Firebase client config)
   - API routes have error handling
5. **Git Status**:
   - Check for uncommitted changes
   - Verify current branch
   - Check if ahead/behind remote
6. **Summarize**: Ready to deploy? List any blockers.
