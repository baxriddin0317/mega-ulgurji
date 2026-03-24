---
description: Run a production build and report all errors and warnings
allowed-tools: Bash, Read
---

Run the production build for MegaHome Ulgurji and analyze results:

1. Run `npm run build` in the project root
2. Capture and analyze the output:
   - Report any TypeScript errors with file locations
   - Report any ESLint warnings
   - Report bundle sizes for each route
   - Flag any routes larger than 200KB
3. If build fails, identify the root cause and suggest fixes
4. Run `npm run lint` to check for additional code quality issues
5. Provide a summary of build health
