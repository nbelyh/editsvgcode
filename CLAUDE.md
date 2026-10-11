# Project conventions for Claude

## Git

- **Ask before anything reaches `main`/`master`.** Committing or pushing to
  `main`/`master`, merging into it (including merging a pull request), and
  rewriting its history all need the user's explicit approval first: show what
  would land (the diff / commits and the message) and wait.
- **Feature branches are free.** On any other branch, commit and push without
  asking.

## Deploying

- **Ask before every deploy**, of anything, anywhere — hosting, functions,
  rules, indexes. Say what would be deployed and where, and wait.
- **Beta only.** Deploy to the beta project (`-P beta`, e.g. `npm run
  deploy:beta`, `npm run deploy:mcp:beta`) unless the user explicitly asks
  for production.
