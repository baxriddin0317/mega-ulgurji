---
description: Audit the codebase for security vulnerabilities
allowed-tools: Bash, Read, Grep, Glob
---

Perform a security audit on MegaHome Ulgurji:

1. **Hardcoded Credentials**: Search for hardcoded passwords, API keys, tokens in all .ts/.tsx files (excluding firebase client config which is expected)
2. **API Route Security**: Check all routes in `app/api/` for:
   - Auth token verification
   - Input validation (Zod schemas)
   - Error handling
   - Rate limiting
3. **Firebase Security**: Review firebase config and admin SDK usage
4. **XSS Vectors**: Check for unsafe HTML rendering or unescaped user input
5. **CSRF Protection**: Verify API routes validate origin/referer
6. **Dependency Vulnerabilities**: Run `npm audit` and report critical/high issues
7. **Environment Variables**: Check what should be in .env but is hardcoded
8. Provide prioritized list of findings with severity (Critical/High/Medium/Low) and fix suggestions
