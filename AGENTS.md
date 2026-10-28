# Project working preferences

- After completing and validating requested changes, automatically merge them into `main` and push `main` to `origin`. The owner has authorized this workflow; no additional confirmation is needed for routine commits, merges, or pushes. If already working on `main`, commit and push there directly.
- Fetch remote changes before integrating. Preserve unrelated work, resolve conflicts carefully, and never force-push or bypass branch protections.
- Keep browser tests muted at the browser level, including when checking audio playback. Do not change the user's own audio preferences for testing.
- Reuse the existing local development server when available.
