# `desktop-app-assets`

## Getting Started

1. Create R2 bucket named `desktop-app-assets` in Cloudflare dashboard. [Here is a guide](CREATING_R2_BUCKET.md).
2. Click the deploy button below and follow the instructions.
3. [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ToDesktop/self-hosted-cdn)
4. The worker should be live at `https://desktop-app-assets.<your_company>.workers.dev/`
5. You may want to add a custom domain for the worker. [Here is a guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Local development

- `npm install`
- `npm run start:prod`
- Add some files to the bucket
- `curl http://127.0.0.1:8787/latest-mac.yml`

## Deploying

- Simply push to the `main` branch.
- or, run `npm run deploy:prod`

## Commands

- `npm run start:prod` - start a local worker
- `npm run deploy:prod` - deploy worker (worker will also deploy when you push to the `main` branch)
- `npm test` - run tests.

## Coming next

- Add dev environment
- Add logging
- Add support for caching and invalidation
