# CLAUDE.md — Clinic Prescription Coordination Platform

## CRITICAL: Source of Truth
blueprint.md is the authoritative specification.

Before starting any task:
1. Read blueprint.md completely
2. Verify the requested work exists in blueprint.md
3. If blueprint.md and implementation conflict, stop and ask for clarification
4. Never modify blueprint.md unless explicitly instructed

Do not invent requirements.
Do not expand scope.
Do not redesign architecture.

---

## Project Summary
Single-clinic prescription coordination platform.

Actors: Doctor, Pharmacy. Phase 1 only.
Patient Portal is explicitly out of scope.

Goal: Replace paper prescriptions with a digital workflow that enables:
- Patient prescription history
- Pharmacy prescription visibility
- Prescription dispensing status tracking

---

## Technology Stack
- Backend: AWS Lambda, API Gateway, DynamoDB
- Frontend: React
- Auth: Clerk
- Hosting: AWS Amplify
- IaC: AWS SAM
- Language: JavaScript only

---

## Development Workflow
For every task:
1. Read relevant sections of blueprint.md
2. State exactly what will be built
3. Identify files that will be created or modified
4. Ask clarifying questions if needed
5. Wait for approval
6. Implement only that task
7. Validate implementation against blueprint.md
8. Explain what was built
9. Ask whether to continue

Never perform multiple major tasks in one step.

---

## Build Order
Follow this order unless instructed otherwise:
1. DynamoDB table definitions
2. SAM template
3. createPatient Lambda
4. getPatient Lambda
5. createPrescription Lambda
6. getPrescriptions Lambda
7. markDispensed Lambda
8. Clerk integration
9. Doctor frontend
10. Pharmacy frontend
11. Deployment

Do not skip ahead.

---

## Data Model Rules

Patient Table:
- patient_id format: W001, W002, W003
- patient_id prefix must remain "W"
- visit_count starts at 1
- visit_count increments only after successful POST /prescriptions
- visit_count never changes during reads

Prescription Table:
- prescription_id is UUID
- status values: pending or dispensed only
- No additional status values permitted
- Records are never deleted

---

## Authorization Rules

Doctor Role:
- Allowed: create patients, view patients, create prescriptions, view history
- Forbidden: modify prescription status

Pharmacy Role:
- Allowed: view pending prescriptions, view details, mark dispensed
- Forbidden: create prescriptions, modify patient data

Enforce role checks on backend endpoints.
Do not rely solely on frontend restrictions.

---

## Architecture Rules
React → API Gateway → Lambda → DynamoDB

DynamoDB is the single source of truth.
Doctor and Pharmacy dashboards must never communicate directly.
All communication occurs through APIs.

---

## Pharmacy Polling Rules
- Use GET /prescriptions?status=pending
- Polling interval: 15 seconds
- Do not implement WebSockets, DynamoDB Streams, EventBridge, or real-time subscriptions
- Polling is an intentional design decision

---

## Hard Constraints
Never add without explicit approval:
- Patient Portal
- SMS notifications
- Mobile number collection
- Inventory management
- Billing systems
- Multi-clinic or multi-doctor support
- QR workflows, OCR, AI features

---

## Testing Rules
After implementing any function:
- Verify request format
- Verify response format
- Verify blueprint compliance
- Verify role permissions
- Verify DynamoDB operations

Provide exact commands for the human to run.
Do not claim tests succeeded unless they actually ran.

---

## Code Standards
- JavaScript only
- Functional React components only
- One Lambda per folder
- Keep functions focused
- Prefer readability over abstraction
- No unused code
- No placeholder implementations

---

## Progress Tracking
Update PROGRESS.md after every milestone.
Record: completed tasks, current task, blockers, next planned task.

---

## Anti-Patterns — Never Do These
- Build multiple backend functions at once
- Change architecture without approval
- Modify blueprint.md
- Invent API endpoints or database fields
- Add third-party services not in blueprint.md
- Claim functionality exists without implementation
- Continue after task completion without approval