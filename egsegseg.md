Avance Professional Development App – Audit & QA Report (June 2026)
Overview
The Avance Professional Development (PD) application is a private, browser‑based tool for improving MSP‑related skills and managing daily work in a local‑first way. According to the unified vision document, its purpose is to help one user (Josh) prepare for shifts, capture knowledge, track tasks and develop professionally without storing sensitive client data[1]. The application is built with Next.js/TypeScript and saves progress in the browser; optional Supabase sync may arrive later[2].
I explored the deployed site (https://avance‑professional‑development.vercel.app/) and inspected repository documentation (VISION.md, README.md, audit.md, TODO.md) to evaluate the app’s current functionality, identify issues and suggest improvements. The findings are summarised below.
Functionality tested
Command centre & daily briefing
Dashboard page shows a daily briefing with “Next shift,” tasks, learning activities, game level, and suggested “One clear next step.” It includes sections for wellbeing reminders and recent logs, which help the user prepare and maintain good habits.
Evidence – the unified vision emphasises low cognitive load and preparation[3]; the dashboard aligns with this principle by consolidating the day’s priorities and wellbeing.
Shifts module
The Shifts page lists scheduled shifts, allows creation of new shifts, and supports starting and ending shifts. Starting a shift displays a pre‑shift checklist with items to tick off. Shift creation uses a modal with date/time pickers; newly created shifts appear in the list.
Issue noted – the “View details” button initially seemed unresponsive; double‑clicking finally opened the shift details. When starting a shift and ticking pre‑shift checklist items, there is no feedback (the checkbox state does not change clearly). Ending a shift logs start/end times correctly.
Work logs module
The Work logs page provides a quick capture form to enter what was done, category, minutes spent, date, shift, tags and notes. Submitted logs appear in a list with editing and deletion options.
Bug – the category and minutes fields reset to default values after saving; for example, a new log with a 10‑minute “Support” entry saved as a 15‑minute “Maintenance” entry. This suggests the form state isn’t bound correctly.
MSP Skills matrix
The MSP skills page lists skills across categories with cards containing suggestions, evidence examples and recommended courses. A “What to practise next” sidebar ranks skills needing attention. This aligns with the core goal of continuous skill building[4].
Each card lists “Suggested practice tasks” and “Evidence examples,” but the links aren’t interactive (clicking does nothing), so collecting evidence is manual.
MSP Scenario trainer
The Scenario trainer presents realistic help‑desk scenarios. Each scenario has a description, what you will learn, suggested questions and safe checks. It is informational and not interactive (no answer submission). The scenario progress drop‑down has a known issue; in the README it is documented that the drop‑down shows a black background making options unreadable[5].
MSP Quiz trainer
The Quiz module allows selection of domain, difficulty and number of questions, then presents multiple‑choice questions. Feedback and scoring are immediate. However, the “Start quiz” button always displayed the total number of available questions rather than the number selected (e.g., “Start Quiz (48 questions)” even when set to 10).
Learning cockpit
The Learning cockpit aggregates recommended training actions with flashcards, troubleshooting steps and role‑play prompts. Activities can be started, but there is no persistence beyond marking them complete. Role‑play uses a deterministic local coach; README notes that LLM integration is not yet implemented[6].
AvanceGame & gamification
AvanceGame introduces gamified elements (levels, XP, daily challenges, “mystery drop,” etc.). While these features create engagement, they have no effect on actual work or learning outcomes. Daily challenges yield trivial tasks (e.g., “Take a headshot break”) without integration to skill tracking.
Security triage & health module
The Security triage page is a static guide outlining safe triage procedures and emphasising not storing sensitive client data. The “Health & outdoors” section encourages hydration, movement and eye breaks; this aligns with the app’s goal of supporting healthy routines[7].
Strengths
Aspect
Evidence & reasons
Comprehensive learning features
The app offers a skills matrix, scenario trainer, quiz and learning cockpit, providing varied ways to practise and measure MSP competencies. The evidence pack summarises practised skills (seen in code and documentation). This structure supports continuous professional growth[8].
Health & wellbeing reminders
The health module prompts hydration, posture resets and daylight breaks, helping address ADHD‑related needs for body awareness[7].
Local‑first privacy
Progress and notes are stored in browser localStorage; README emphasises that no sensitive client data is stored and optional Supabase sync may be added later[2]. This respects client confidentiality[9].
Quick capture of work & follow‑ups
Quick‑capture forms for work logs and follow‑ups make it easy to record tasks and reminders, aligning with backlog requirements for structured note taking and follow‑up tasks[10].
Gamified engagement
Quizzes, XP, levels and daily challenges encourage regular use and practise, though they currently lack deeper ties to skills progression.

Issues and bugs
Issue
Observation
Impact
Scenario progress drop‑down invisible
The “Scenario progress” select on the scenario trainer page shows a black background; options cannot be read, as acknowledged in README[5].
Hinders navigating through scenario progress.
Work‑log form resets values
Minutes and category revert to defaults after saving; a 10‑minute “Support” entry saved as a 15‑minute “Maintenance” entry.
Leads to inaccurate time tracking.
Form controls lack feedback
In the shift pre‑checklist, ticking items does not visually update; “View details” button requires double‑click.
Confusing user experience; users cannot tell if an action succeeded.
Quiz start button shows wrong question count
Regardless of selected question count, the button label displays total available questions.
Minor UI bug; could confuse users.
Static or non‑interactive links
Links in skill cards and scenario evidence examples are not clickable; the user cannot open suggested resources directly.
Reduces usability of training materials.
Gamification lacks integration
AvanceGame metrics (XP, events) are decorative and do not influence training outcomes.
Could result in wasted development effort if not tied to meaningful learning.
No manual editing in KB learning machine
README notes that the knowledge base seeds cards and evidence but lacks create/edit/delete functionality[11].
Limits ability to build personal knowledge repository.

Gaps & areas for improvement
Functional gaps highlighted in documentation
The audit document lists several missing features: integration with ticketing and phone systems, checklists for onsite visits and quotes, issue‑based decision trees, and billing support[12]. The opportunities section suggests adding API integrations for live ticket lists, interactive playbooks for common issues, better follow‑up reminders, quoting calculators and contextual help[13]. These match my observations: the current app is siloed from external systems and lacks guided workflows.
Usability and accessibility
Feedback and state clarity – Many actions (e.g., ticking checklists, changing quiz settings) do not provide clear feedback. Using accessible checkboxes with visible state changes and disabling buttons during processing would help.
Navigation & discoverability – Modules like Work logs, MSP skills, scenarios and quiz are hidden behind a horizontal navigation bar that may not be obvious on smaller screens. A sidebar or a collapsed mobile menu could improve navigation.
Colour themes – The dark/light toggle works, but some dark‑mode elements (e.g., the black drop‑down) are not tested thoroughly.
Feature enhancements
Integrate “Issue Decision Trees” – A quick issue‑based decision tree could help decide which portal to open and what steps to follow when dealing with common problems (e.g., email down, Wi‑Fi issues, device onboarding). This would operationalise workflow assumptions.
On‑site and quote workflow – Implement guided checklists for onsite visits (keys, safety checks, follow‑up email) and quoting (device counts, scope, photos). Completed checklists could produce a summary for later invoicing or quoting.
Improved knowledge base – Allow users to create, edit and delete cards in the KB learning machine; import knowledge from private PDFs; add search. Linking practice evidence to work logs would build a cohesive knowledge repository.
Real‑time integrations – Even a read‑only view of open tickets from Halo or call logs from 3CX would reduce context switching and ensure tasks and follow‑ups are based on live data[14]. Externally accessible APIs could be integrated in the future.
Billing and time tracking – Extend the invoicing section to generate simple invoices based on shifts and work logs, factoring in client MSA status and hourly rates. Export to a CSV or PDF for manual import into Halo or accounting software.
Adaptive learning – Use quiz results and work log topics to suggest which skills to practise next and adjust quiz difficulty. This would link gamification to meaningful progress.
Recommendations
Fix UI bugs and form state:
Ensure select elements use the correct Tailwind/aria styling; fix the scenario progress drop‑down. Provide visible feedback when checklists are ticked and when forms submit.
Bind form state to the saved object properly; maintain the selected category and minutes when creating work logs.
Correct the quiz button label by using the selected number of questions instead of the total pool.
Implement an Issue Decision‑Tree Component:
Create a DecisionTree component with a structured JSON of common issues and step‑by‑step troubleshooting questions. Render a collapsible tree that guides the user through safe checks and recommended actions. Add this to the navigation and persist progress.
Add On‑site and Quoting Checklists:
Introduce new pages for On‑site and Quotes with checklists based on workflow assumptions (vehicle keys, gear, requirements gathering, photo capture, labour estimate). Completed checklists should generate a summary note that can be attached to work logs.
Enhance Knowledge Base Functionality:
Implement CRUD operations for cards and allow import from local PDF/Markdown files. Link KB articles to work logs and scenario evidence, and provide full‑text search. Ensure changes persist in local storage and optionally sync via Supabase when enabled.
Integrate Basic Ticket Feed:
Provide a placeholder list for live tickets (e.g., load from a JSON file or simple API). Allow linking work logs to a ticket ID; highlight ticket status and due date. Real API integration can be added later.
Connect Gamification to Learning Outcomes:
Tie XP and level progression to completion of skills training, quiz performance and evidence submission rather than arbitrary daily tasks. Use the XP to unlock advanced scenarios or badges.
Proposed prompts for Copilot & Codex
Prompt 1 – Implement an Issue Decision Tree (for Codex or an AI code assistant)
Context: You are working on the Avance Professional Development Next.js/TypeScript project. The app supports MSP learning and task tracking. A major gap is the lack of a quick issue‑based decision tree to help decide which tool or playbook to use for common IT issues.
Task: Create a reusable React component called DecisionTree that renders an interactive decision tree for troubleshooting common issues. Define a JSON schema representing nodes (id, question, options, result) and write a TypeScript type for the tree. The component should display the current question and possible options (as buttons). When the user selects an option, advance to the next node or show the result with recommended actions and escalation steps. Persist the user’s progress in localStorage so returning to the page restores the last point. Add a new page /decision-tree that imports a starter tree with at least three issues (e.g., “Email not sending,” “Wi‑Fi not working,” “New user setup”) and link to it from the navigation. Ensure the UI uses shadcn/ui or Tailwind components for consistent styling and works in dark and light modes. Document how to extend the tree data for future issues.
Prompt 2 – Fix UI bugs & extend Work Log & Knowledge Base (for Copilot in VS Code)
Context: The Avance Professional Development app has several UI bugs and missing features. The “Scenario progress” select in the MSP scenario trainer has unreadable options due to dark‑mode styling[5]. The work‑log form resets the selected category and minutes after saving, leading to incorrect entries. The knowledge‑base module lacks manual create/edit/delete functionality[11].
Tasks:
Fix the scenario progress select: Investigate the component under /app/msp-scenarios that renders the scenario progress <Select> and adjust the Tailwind/shadcn classes so the drop‑down background and options contrast correctly in dark mode. Ensure options are visible when opened.
Correct work‑log form state: In /app/work-logs (or similar), refactor the form to use controlled components (e.g., useState or React Hook Form) for category and minutes. Ensure that when a user changes these fields and clicks “Save Work Log,” the selected values are persisted in the saved log rather than reverting to defaults. Add unit tests to verify this behaviour.
Add CRUD to Knowledge Base: Under the knowledge‑base or KB learning machine module, implement create, edit and delete operations for flashcards or knowledge cards. Use localStorage (Dexie/IndexedDB) to store the cards. Provide a modal or page for creating a new card with fields for title, description, tags, and practice evidence. Allow editing and deleting existing cards. Update the UI to reflect changes immediately and ensure persistence across sessions.
Optional: Provide typed hooks or services for interacting with Dexie/IndexedDB to simplify future storage features.
Expectations: Maintain TypeScript type safety, follow the project’s styling conventions, and write descriptive comments. Test the fixes manually in dark/light modes to confirm that the select component and form behave correctly.
Conclusion
The Avance Professional Development app already delivers a solid foundation for tracking shifts, logging work and practising MSP skills. Its local‑first design, structured learning modules and wellbeing focus align with the project vision[3]. However, several usability issues and missing features limit its effectiveness. Addressing UI bugs, improving form state management, adding guided decision trees and checklists, enhancing the knowledge base and integrating even basic ticket information will make the app a more powerful, trusted companion for MSP work. The prompts above give clear next steps for AI coding assistants to implement these improvements.

[1] [2] [3] [4] raw.githubusercontent.com
https://raw.githubusercontent.com/joshparri/AvanceProfessionalDevelopment/main/VISION.md
[5] [6] [11] raw.githubusercontent.com
https://raw.githubusercontent.com/joshparri/AvanceProfessionalDevelopment/main/README.md
[7] [8] [9] [10] [12] [13] [14] raw.githubusercontent.com
https://raw.githubusercontent.com/joshparri/AvanceProfessionalDevelopment/main/audit.md
