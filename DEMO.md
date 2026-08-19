# AccountPath demo walkthrough

This script uses three target accounts that resolve in the frozen Cognition seed graph. The path
results below were checked with `findPaths` using the app shell's reference date of
`2026-08-19T00:00:00Z`.

## 1. Ramp

1. Open the Accounts route at `/`.
2. Search for `Ramp`.
3. Open the Ramp account detail.
4. Review the two-hop path through Goldman Sachs. The path is marked Customer because Ramp is an
   existing customer in the seed data.
5. Open the verified edge source links from the path labels.

## 2. Bilt Rewards

1. Return to `/` and search for `Bilt Rewards`.
2. Open the account detail.
3. Review the two-hop path through General Catalyst.
4. Expand any remaining ranked paths if present.
5. Read the suggested ask, which uses the shared investor relationship template.

## 3. American Express

1. Return to `/` and search for `American Express`.
2. Open the account detail.
3. Review the three-hop path ending with Kenneth I. Chenault's former operator relationship with
   American Express.
4. Follow the verified source links for the chairman and employment edges.
5. Read the suggested ask, which uses the former operator relationship template.

The `/graph` route provides the whole-graph canvas and the `/edit` route provides local-only
node/edge editing, JSON export, and reset-to-seed controls.
