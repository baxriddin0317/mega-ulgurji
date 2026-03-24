---
description: Investigate and fix a specific bug or issue
argument-hint: <describe the bug or paste error message>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

Investigate and fix the reported issue in MegaHome Ulgurji.

Bug report: $ARGUMENTS

Steps:
1. **Understand**: Parse the bug description or error message
2. **Locate**: Find the relevant files using Grep/Glob
3. **Trace**: Follow the data flow (Component → Store → Firebase → back)
4. **Root Cause**: Identify why it's happening
5. **Fix**: Make the minimal change needed to resolve the issue
6. **Verify**: Run `npm run build` to ensure no regressions
7. **Report**: Explain what was wrong and what was changed
