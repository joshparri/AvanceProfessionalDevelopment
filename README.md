# Avance Professional Development App

## Overview
The Avance Professional Development app is a private web application designed to support professional growth in Managed Service Provider (MSP) IT roles. It provides practical training tools, scenario practice, and progress tracking to help build skills in helpdesk support, endpoint management, Microsoft 365 administration, networking, cybersecurity, and client communication.

## Features
- **MSP Skills Matrix**: Browse and track readiness across 14 MSP skill categories, from helpdesk triage to client communication.
- **MSP Scenario Trainer**: Practice realistic ticket scenarios with feedback on troubleshooting approach, safety, and escalation judgment.
- **Ticket Notes Trainer**: Learn to write professional, clear ticket notes with before/after examples, practice prompts, and a quality rubric.
- **Evidence Pack**: Generate manager-safe professional development summaries based on completed activities.
- **MSP Roadmap**: View an 8-stage progression from Level 1 helpdesk foundations to L2 readiness and client ownership.
- **Saved Local Progress**: Progress and preferences are saved in browser localStorage for continuity across sessions.

## Current Implementation Status
The app currently includes the MSP Professional Development features listed above. Other planned features (Work Logs, Tasks, Knowledge Base, Playbooks, Clients, Learning Tracker, etc.) are documented in `TODO.md` but not yet implemented. Accessing these routes will result in 404 errors until they are built.

## Known Issues
- On the MSP Scenario Trainer page (`/msp-scenarios`), the "Scenario progress" select dropdown shows a black background when opened, making options invisible (though selection still works).
- The Evidence Pack page lacks a "Copy to clipboard" button for the Markdown summary.
- The Ticket Notes Trainer is not accessible via navigation (only direct URL).

These issues are noted for future code updates.

## App Location
The application source code is located in the `/app` folder.

## Running Locally
To run the app locally:

1. Navigate to the app directory:
   ```
   cd app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Building the App
To build the app for production:

```
npm run build
```

This generates optimized static files in the `.next` folder.

## Repository Structure
- `docs/`: Documentation including requirements, architecture, guides, and QA materials.
- `app/`: Next.js application source code.
- `build/`: Build prompts and instructions.
- `archive/`: Archived files.

## Deployment
See `docs/deployment/vercel_deployment.md` for Vercel deployment instructions.

## Getting Started
1. Read `VISION.md`
2. Review `docs/vision/` and `docs/requirements/`
3. Review `docs/professional_development/msp_skills_academy.md`
4. Use `build/master_prompt.md` with Claude Code to build the app
5. Follow `docs/guides/` for usage and planning

## Maintenance
- Update documents as Josh learns more about Avance
- Add new research or guides to appropriate `docs/` subfolders
- Build app code in `app/` directory
- Archive outdated materials in `archive/`
