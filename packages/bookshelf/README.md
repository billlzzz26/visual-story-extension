# Article Workspace

A standalone app built on the [Craft API](https://developer.craft.do).

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to try the app with demo data.

To use your own data, switch **Storage Location** to **In Craft** and connect your workspace.

## How it works

- By default, the app runs with demo data stored in your browser (no setup needed).
- Switch to "In Craft" to connect your Craft workspace via OAuth.
- The app exchanges the authorization code for tokens (server-side, with PKCE).
- Your workspace data is fetched via the Craft REST API and rendered in the UI.
- Access tokens are refreshed automatically when they expire (no re-authentication needed).

All secrets are kept server-side in HTTP-only cookies — access tokens are memory-only in the browser and refresh tokens never touch JavaScript.
