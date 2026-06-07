# blueprint.md — Clinic Prescription Coordination Platform

## Project Overview

A web-based prescription coordination platform for a single small clinic in semi-urban India.

The system replaces paper prescriptions with a digital doctor-to-pharmacy workflow, creating persistent patient medication records and prescription status tracking.

**One clinic. One doctor. One pharmacy. Demo deployment only.**

---

## Problem

Paper prescriptions cause three failures:

* Doctors have no patient prescription history on return visits
* Pharmacies rely on handwritten prescriptions
* Patients have no persistent medication record

---

## Solution

Two dashboards — Doctor and Pharmacy — connected through a shared DynamoDB backend.

* Doctors create digital prescriptions
* Pharmacy receives new prescriptions through periodic polling
* Prescription status is tracked from creation through dispensing

---

## Phase 1 Scope

### Included

* Doctor Portal
* Pharmacy Portal
* Backend (Lambda + API Gateway + DynamoDB)
* Auth (Clerk — Doctor and Pharmacy roles)
* AWS deployment via Amplify

### Deferred

* Patient Portal
* Multi-doctor support
* Multi-clinic support
* QR-based lookup
* SMS notifications

---

## Tech Stack

* Backend: AWS Lambda + API Gateway + DynamoDB
* Auth: Clerk (Doctor and Pharmacy roles)
* Frontend: React (single application, two role-based views)
* Hosting: AWS Amplify
* Infrastructure as Code: AWS SAM
* Architecture: Fully serverless

---

## Data Model

### Patient Table

**Partition Key:** `patient_id`

| Field       | Type   | Notes                                            |
| ----------- | ------ | ------------------------------------------------ |
| patient_id  | String | Format: W001, W002, W003                         |
| name        | String | Patient full name                                |
| age         | Number | Patient age                                      |
| gender      | String | Male, Female, Other                              |
| visit_count | Number | Starts at 1. Increments on prescription creation |
| created_at  | String | ISO timestamp                                    |

#### Rules

* patient_id prefix hardcoded as "W" for demo deployment
* visit_count increments atomically
* visit_count increments only when POST /prescriptions succeeds
* visit_count never changes during reads

---

### Prescription Table

**Partition Key:** `prescription_id`

| Field           | Type   | Notes                              |
| --------------- | ------ | ---------------------------------- |
| prescription_id | String | Auto-generated UUID                |
| patient_id      | String | References Patient table           |
| medications     | List   | Each item: name, dosage, frequency |
| status          | String | pending or dispensed               |
| created_at      | String | ISO timestamp                      |

#### Rules

* status can only be pending or dispensed
* Records are never deleted
* Doctor creates prescriptions
* Pharmacy updates dispensing status only
* Audit history is preserved

---

## API Contract

### POST /patients

Creates a new patient profile.

#### Request

```json
{
  "name": "Ravi Kumar",
  "age": 54,
  "gender": "Male"
}
```

#### Response

```json
{
  "patient_id": "W001",
  "name": "Ravi Kumar",
  "age": 54,
  "gender": "Male",
  "visit_count": 1,
  "created_at": "2026-06-06T10:30:00Z"
}
```

---

### GET /patients/{id}

Loads existing patient profile.

#### Response

```json
{
  "patient_id": "W001",
  "name": "Ravi Kumar",
  "age": 54,
  "gender": "Male",
  "visit_count": 3,
  "created_at": "2026-06-06T10:30:00Z"
}
```

---

### POST /prescriptions

Creates a prescription and increments patient visit_count.

#### Request

```json
{
  "patient_id": "W001",
  "medications": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily"
    }
  ]
}
```

#### Response

```json
{
  "prescription_id": "rx-uuid",
  "patient_id": "W001",
  "status": "pending",
  "created_at": "2026-06-06T10:32:00Z"
}
```

---

### GET /prescriptions/{patient_id}

Returns full prescription history for a patient.

Used by doctor dashboard.

---

### GET /prescriptions?status=pending

Returns all pending prescriptions.

Used by pharmacy polling workflow.

#### Notes

* Pharmacy dashboard polls every 15 seconds
* Status-based query pattern may use a GSI if required

#### Example Response

```json
{
  "prescription_id": "rx-uuid",
  "patient_id": "W001",
  "patient_name": "Ravi Kumar",
  "patient_age": 54,
  "medications": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily"
    }
  ],
  "status": "pending",
  "created_at": "2026-06-06T10:32:00Z"
}
```

---

### PATCH /prescriptions/{prescription_id}

Marks prescription as dispensed.

Only Pharmacy role may call this endpoint.

#### Request

```json
{
  "status": "dispensed"
}
```

#### Response

```json
{
  "prescription_id": "rx-uuid",
  "status": "dispensed"
}
```

---

## Doctor Portal — User Flow

### Landing Screen

* Add New Patient
* Existing Patient

---

### Add New Patient

1. Doctor clicks Add New Patient
2. Form appears: Name, Age, Gender
3. Doctor clicks Save
4. System calls POST /patients
5. Patient record created, ID displayed on screen
6. Prescription form opens immediately
7. Doctor enters: Medication Name, Dosage, Frequency
8. Doctor clicks Save Prescription
9. System calls POST /prescriptions
10. Prescription stored with status = pending

---

### Existing Patient

1. Doctor clicks Existing Patient
2. Search field appears
3. Doctor enters patient ID
4. System calls GET /patients/{id}
5. Patient profile loads
6. System calls GET /prescriptions/{patient_id}
7. Prescription history displayed
8. Doctor reviews history
9. Doctor creates new prescription
10. POST /prescriptions executed
11. visit_count increments

---

## Pharmacy Portal — User Flow

### Dashboard

Every 15 seconds:

```text
GET /prescriptions?status=pending
```

Each pending prescription displays as a card:

* Patient Name
* Patient Age
* Patient ID
* Created Time

Sorted newest first.

---

### Dispensing Flow

1. Patient arrives at pharmacy
2. Pharmacist locates matching prescription card by name
3. Pharmacist opens prescription
4. System displays:

   * Patient Name
   * Age
   * ID
   * Visit Count
   * Medication List
   * Dosage
   * Frequency
5. Pharmacist dispenses medicines
6. Pharmacist clicks Mark as Dispensed
7. System calls PATCH /prescriptions/{prescription_id}
8. Status changes to dispensed
9. Card disappears from pending list
10. Doctor can see updated status in patient history

---

## Authorization Rules

### Doctor Role

#### Allowed

* Create patients
* View patients
* Create prescriptions
* View prescription history

#### Forbidden

* Change prescription status

---

### Pharmacy Role

#### Allowed

* View pending prescriptions
* View prescription details
* Mark prescriptions dispensed

#### Forbidden

* Create prescriptions
* Modify patient records

---

## Key Architecture Decisions

| Decision         | Choice      | Reason                                         |
| ---------------- | ----------- | ---------------------------------------------- |
| Auth             | Clerk       | Faster delivery within 10-day sprint           |
| Sync             | Polling     | Workflow does not require real-time WebSockets |
| Database         | DynamoDB    | Fully serverless architecture                  |
| IaC              | AWS SAM     | Repeatable infrastructure deployment           |
| Patient IDs      | W001 format | Simple clinic-scoped identifiers               |
| Deletion         | Disabled    | Preserve audit history                         |
| Complaints Field | Removed     | Not required for MVP                           |
| Mobile Numbers   | Removed     | Simplify workflow                              |
| Patient Portal   | Deferred    | Phase 2 enhancement                            |

---

## Folder Structure

```text
/clinic-platform
│
├── CLAUDE.md
├── blueprint.md
├── PROGRESS.md
├── README.md
├── template.yaml
│
├── backend
│   └── functions
│       ├── createPatient
│       ├── getPatient
│       ├── createPrescription
│       ├── getPrescriptions
│       └── markDispensed
│
├── frontend
│
└── docs
```

---

## What Does Not Exist In This Project

* No EC2
* No RDS
* No WebSockets
* No DynamoDB Streams
* No patient portal in Phase 1
* No SMS notifications
* No mobile number collection
* No complaints field
* No multi-clinic support
* No inventory management
* No billing system
* No TypeScript
* No separate doctor and pharmacy frontend applications
