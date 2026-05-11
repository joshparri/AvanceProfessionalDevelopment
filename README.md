# Avance Work Companion Repository

## Overview
This repository contains the complete documentation, build instructions, and organizational structure for the Avance Work Companion – a private web application designed to help Josh excel in his part-time IT support role at Avance Business Technology.

## Repository Structure

### Root Files
- `VISION.md` - Unified vision document reconciling all source materials
- `TODO.md` - Implementation roadmap and backlog

### docs/
Documentation organized by category:
- `vision/` - Product vision documents
- `requirements/` - PRD, user stories, acceptance criteria
- `architecture/` - Technical architecture, IA, UI/UX guides
- `professional_development/` - MSP Skills Academy specification and PD growth TODOs
- `research/` - Background research on Avance and industry context
- `guides/` - User guides, checklists, plans, and quick references
- `resources/` - Supporting files (PDFs, spreadsheets, etc.)

### build/
Build instructions and prompts for creating the application:
- `master_prompt.md` - Main Claude Code prompt
- `second_pass_prompt.md` - Refinement prompt
- `claude_code_prompt.md` - Alternative build prompt

### app/
Reserved for the application source code (to be built using the prompts in `build/`)

### archive/
Archived files, downloads, and backups (not part of active development)

## Key Documents
- Start with `VISION.md` for the overall vision
- `docs/vision/product_vision.md` for product vision
- `docs/requirements/prd.md` for requirements
- `docs/professional_development/msp_skills_academy.md` for the MSP professional development feature specification
- `docs/professional_development/msp_pd_growth_todo.md` for the MSP PD implementation checklist
- `docs/guides/first_week_quick_ref.md` for practical usage
- `build/master_prompt.md` to build the app

## Vision Summary
The Avance Work Companion supports Josh's part-time MSP work through preparation, knowledge capture, task management, continuity, and professional development in IT MSP skills. It's a personal, local-first web app built with Next.js, TypeScript, and Tailwind CSS.

## No Competing Visions
All source documents align on a consistent vision of a practical, personal work companion for regional IT support work.

## Professional Development Focus
The app and documentation emphasize Josh's growth in overall IT MSP skills as a core purpose, integrated throughout preparation, tracking, reflection, scenario practice, ticket note quality, client communication, and professional evidence generation.

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
