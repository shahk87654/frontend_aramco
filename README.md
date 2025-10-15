# Aramco Review Platform - Client

This is the React frontend for the Aramco station review and admin CRM platform.

## Features
- GPS/QR-based station selection
- Review submission (star rating, comments)
- Authentication (email/phone)
- Reward system
- Admin dashboard

## Setup
1. Run `npm install` in this directory.
2. Run `npm start` to launch the development server.

## Deploying to Vercel

To deploy the client to Vercel as a static site (recommended):

1. In Vercel, import the GitHub repo `shahk87654/aramcopakapp` and set the project root to `client`.
2. Set the Build Command to `npm run build` and the Output Directory to `build` (Vercel usually detects this automatically).
3. Add an environment variable for production builds named `REACT_APP_API_URL` with the URL of your Railway backend (for example `https://your-railway-url`).
4. Deploy — Vercel will run the build and publish a static site.

We included a top-level `vercel.json` to explicitly instruct Vercel to build the `client` directory as a static build. The client automatically uses `process.env.REACT_APP_API_URL` in production; otherwise, it falls back to the `proxy` setting for local development.
