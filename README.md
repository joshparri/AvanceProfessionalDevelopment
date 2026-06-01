# Avance Professional Development App

## Overview
The Avance Professional Development app is a private web application designed to support professional growth in Managed Service Provider (MSP) IT roles. It provides practical training tools, scenario practice, and progress tracking to help build skills in helpdesk support, endpoint management, Microsoft 365 administration, networking, cybersecurity, and client communication.

## Features
- **MSP Skills Matrix**: Browse and track readiness across 14 MSP skill categories, from helpdesk triage to client communication.
- **MSP Scenario Trainer**: Practice realistic ticket scenarios with feedback on troubleshooting approach, safety, and escalation judgment.
- **Interactive Learning Cockpit**: Practise selected activities with free-text flashcards, step-by-step troubleshooting, and role-play chat drills.
- **Ticket Notes Trainer**: Learn to write professional, clear ticket notes with before/after examples, practice prompts, and a quality rubric.
- **Evidence Pack**: Generate manager-safe professional development summaries based on completed activities.
- **MSP Roadmap**: View an 8-stage progression from Level 1 helpdesk foundations to L2 readiness and client ownership.
- **Local Backup & Settings**: A new Settings page now supports theme preference, export/import backup, and full data reset.

## Current Implementation Status
The app currently includes the MSP Professional Development features listed above. Other planned features (Work Logs, Tasks, Knowledge Base, Playbooks, Clients, Learning Tracker, etc.) are documented in `TODO.md` but not yet implemented. Accessing these routes will result in 404 errors until they are built.

## Known Issues
- On the MSP Scenario Trainer page (`/msp-scenarios`), the "Scenario progress" select dropdown shows a black background when opened, making options invisible (though selection still works).
- The KB Learning Machine currently uses localStorage only; there is no import from private Avance KB PDFs.
- The KB Learning Machine has seeded field cards and local practice evidence, but not manual card create/edit/delete yet.
- Learning Cockpit role-play currently uses a deterministic local coach; no GROQ/LLM API integration exists in this repo yet.

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
4. Review `docs/implementation-plans/two-app-prompt-pack-roadmap.md` for the App 1/App 2 prompt-pack backlog
5. Review `docs/guides/prompt_pack_recommendations.md` for AI coaching and prompt pack guidance
6. Use `build/master_prompt.md` with Claude Code to build the app
7. Follow `docs/guides/` for usage and planning

## Maintenance
- Update documents as Josh learns more about Avance
- Add new research or guides to appropriate `docs/` subfolders
- Build app code in `app/` directory
- Archive outdated materials in `archive/`
