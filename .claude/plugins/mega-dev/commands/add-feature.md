---
description: Plan and implement a new feature for the e-commerce app
argument-hint: <describe the feature to add>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

Plan and implement a new feature for MegaHome Ulgurji.

Feature request: $ARGUMENTS

Steps:
1. **Analyze**: Understand the feature requirements
2. **Plan**: Identify which files need changes:
   - New/modified Zustand store? (store/)
   - New/modified types? (lib/types.ts)
   - New/modified components? (components/)
   - New/modified pages? (app/)
   - New/modified API routes? (app/api/)
   - Firebase schema changes?
3. **Implement**: Build the feature following project conventions:
   - TypeScript types first
   - Zustand store if needed
   - Components with Tailwind CSS
   - Pages with proper routing
   - API routes if backend needed
4. **Quality Check**:
   - All text in Uzbek for UI
   - Mobile responsive
   - Loading and error states
   - Type-safe (no `any`)
5. **Build**: Run `npm run build` to verify
6. **Summary**: Document what was added and how to test it
