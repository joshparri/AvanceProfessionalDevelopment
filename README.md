# Avance Professional Development App

## Overview
The Avance Professional Development app is a private web application designed to support professional growth in Managed Service Provider (MSP) IT roles. It provides practical training tools, scenario practice, and progress tracking to help build skills in helpdesk support, endpoint management, Microsoft 365 administration, networking, cybersecurity, and client communication.

## Features
- **Dashboard / daily briefing**: Daily shift summary, pre-shift checklist, recent logs, and learning recommendations.
- **Shifts**: Scheduled shift list and shift detail pages with prep checklist support.
- **Work Logs**: Work log capture with recent activity and time tracking.
- **Tasks**: Task list and task management workflow.
- **KB Learning Machine**: Knowledge capture and practice decks for MSP topics.
- **Ticket Notes Trainer**: Practice writing better notes with examples and guidance.
- **Evidence Pack**: Generate professional development summaries from completed activities.
- **Learning Cockpit**: Learning activities and practice recommendations for MSP skills.
- **MSP Skills Matrix**: Progress tracker for MSP skill readiness.
- **MSP Scenario Trainer**: Scenario practice with troubleshooting guidance.
- **MSP Roadmap**: Progression path from foundational helpdesk work toward client ownership.
- **Vendor Remote Session workflow**: Guided remote support session handling.
- **Monitoring Alert Sanitizer**: Alert sanitization workflow and route.
- **Change Guardrail**: Change planning and risk guardrails.
- **Security Alert Triage**: Security alert review and response guidance.
- **Health & Outdoors**: Wellbeing and outdoors support content.
- **Onsite Checklist**: Onsite visit preparation checklist.
- **Settings / local backup / theme preferences**: Export/import backup, theme switching, and reset.

## Current Implementation Status
The app currently includes the MSP professional development features listed above and a growing set of workflow pages under `/app`. Many planned workflows and page refinements are tracked in `TODO.md`, but the app already includes core live routes for shifts, work logs, tasks, KB learning, scenario training, and more.

## Known Issues / Notes
- MSP Scenario Trainer: dropdown contrast issue has been fixed in the latest implementation pass; verify visually in a deployed build.
- KB Learning Machine: still local-first (localStorage/Dexie) with no PDF import or external sync.
- KB Learning Machine: some manual card create/edit flows remain to be polished.
- Learning Cockpit: uses a deterministic local coach; no external LLM integrations are present.

Please refer to `docs/qa/msp_pd_smoke_test.md` for the latest verification checklist and deployment notes.

## App Location
The application source code is located in the `/app` folder.

## Running Locally
To run the app locally:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

The app will be available at `http://localhost:5173` by default.

## Building the App
To build the app for production:

```
npm run build
```

This generates optimized static files in the `dist` folder.

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
