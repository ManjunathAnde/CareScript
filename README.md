# CareScript: Clinic Prescription Coordination Platform

> A serverless AWS platform that connects doctors, pharmacists, and patients, replacing paper-based prescription workflows with a real-time digital system.

🔗 **[Live link ](https://main.dy43b2jej051.amplifyapp.com)** | **[GitHub](https://github.com/ManjunathAnde/CareScript)** | **[LinkedIn](https://www.linkedin.com/in/manjunath-ande/)**

**Demo Credentials**
| Role | Username | Password |
|------|----------|----------|
| Doctor | `doctor` | `carescript123` |
| Pharmacy | `pharmacy` | `carescript456` |

---


## 🎯 The Problem

Many small clinics in India still rely on paper-based prescription workflows. What appears simple on the surface creates communication gaps, operational inefficiencies, and patient safety risks across the entire care journey.

### 🧑‍⚕️ Patients struggle to understand prescriptions

Handwritten instructions, abbreviations, and clinical shorthand often leave patients unsure about what they are taking and why. Handwritten prescriptions have been reported to carry an error rate of **35.7%**, compared to **2.5%** for electronic prescriptions.

> *Journal of Drug Delivery and Therapeutics, 2024*

### 📄 Lost prescriptions disrupt continuity of care

Patients frequently misplace paper prescriptions, making it difficult to recall medication history during future consultations. Prescription completeness in Indian outpatient settings has been reported as low as **52%**, creating gaps even before records are lost.

> *International Journal of Basic and Clinical Pharmacology, 2025*

### 👨‍⚕️ Doctors lose visibility after the consultation

Once a prescription leaves the clinic, doctors have no way to know whether it was dispensed, delayed, or never collected. More than **80%** of Indian healthcare facilities still operate in disconnected data environments.

> *Ayushman Bharat Digital Mission, 2025*

### 📊 Clinics lack reliable dispensing records

Without digital tracking, clinics and pharmacies struggle with inventory monitoring, reconciliation, and reporting. Only **20%** of healthcare providers have adopted digital systems across core operational workflows.

> *Ayushman Bharat Digital Mission, 2025*

### 📧 Patients receive no status updates

Patients often have no visibility into when their medications are ready, leading to unnecessary waiting and repeat visits. Research has shown a direct relationship between pharmacy wait times and patient satisfaction.

> *National Journal of Physiology, Pharmacy and Pharmacology, 2018*

---

CareScript digitizes the entire prescription lifecycle, connecting doctors, pharmacies, and patients through a single real-time platform.

---

## ⚙️ What It Does

CareScript coordinates three actors across a shared AWS backend.

### 👨‍⚕️ Doctor Portal
- Registers patients with permanent sequential IDs (W001, W002...)
- Writes digital prescriptions with medication name, dosage, and frequency
- Receives confirmation when a prescription has been dispensed, closing the loop between consultation and pharmacy
- Looks up existing patients with full prescription history

### 💊 Pharmacy Portal
- Maintains a live digital queue of all pending prescriptions, updated every 15 seconds
- Processes each dispense through a confirmation modal showing patient name, ID, and medications
- Keeps a permanent dispensing record giving clinic owners full transaction visibility

### 👤 Patient
- Receives an automated email the moment medicines are ready for collection
- Email contains Patient ID, complete medication list with dosage instructions, and collection instructions
- Serves as a permanent digital record the patient can reference at any future consultation

---

## 🏗️ Architecture

```
React (AWS Amplify)
        |
        v
API Gateway (REST)
        |
        |-- POST   /patients                   createPatient Lambda
        |-- GET    /patients/{id}              getPatient Lambda
        |-- POST   /prescriptions              createPrescription Lambda
        |-- GET    /prescriptions/patient/{id} getPrescriptions Lambda
        |-- GET    /prescriptions?status=pending getPrescriptions Lambda
        |-- PATCH  /prescriptions/{id}         markDispensed Lambda
                                                      |
                                                      v
                                               AWS SES (email)
        |
        v
DynamoDB
  |-- ClinicPatients  (PK: patient_id)
  |-- ClinicPrescriptions  (PK: prescription_id)
        |-- GSI: PatientIndex  (patient_id, created_at)
        |-- GSI: StatusIndex   (status, created_at)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Hosting | AWS Amplify with CI/CD from GitHub |
| API | AWS API Gateway (REST) |
| Backend | AWS Lambda, Node.js 20.x, 5 functions |
| Database | AWS DynamoDB, 2 tables, 2 GSIs |
| Notifications | AWS SES |
| Infrastructure | AWS SAM (Infrastructure as Code) |

---

## 🧠 Key Engineering Decisions

### 🔄 Polling over WebSockets for the pharmacy queue
- The pharmacy workflow is not real-time chat. A patient walks between rooms and updates happen every few minutes, not every few milliseconds
- A 15-second polling interval matches actual clinical usage without WebSocket connection management or infrastructure overhead
- Deliberately chose the right tool for the workflow, not the most technically impressive one

### 🔢 COUNTER item for sequential Patient IDs
- DynamoDB has no auto-increment. You must supply the ID on every insert or the write is rejected
- A dedicated COUNTER row uses DynamoDB's atomic ADD operation to generate W001, W002, W003... without race conditions, even under concurrent registrations
- UUIDs were rejected because no patient can memorize or quote `550e8400-e29b-41d4` verbally to a receptionist
- Short, human-readable IDs are a functional requirement in a clinic setting, not an aesthetic preference

### 🔒 TransactWriteItems for prescription creation
- Creating a prescription and incrementing the patient's visit count are two separate DynamoDB writes
- If one succeeds and the other fails, the data is permanently inconsistent
- TransactWriteItems wraps both operations atomically. Both succeed or both fail. No partial state ever exists in the database

### 🔗 Loosely coupled architecture across three roles
- Doctor, pharmacy, and patient never communicate directly. All three interact only through DynamoDB
- The doctor writes. The pharmacy reads. The patient receives a notification
- Any portal can be extended, replaced, or taken offline without affecting the others
- This mirrors a loosely coupled microservices pattern at a scale appropriate for a single clinic

---

## 📂 Project Structure

```
clinic-platform/
|-- backend/
|   |-- functions/
|       |-- createPatient/
|       |-- getPatient/
|       |-- createPrescription/
|       |-- getPrescriptions/
|       |-- markDispensed/        (includes SES notification)
|-- frontend/
|   |-- src/
|       |-- App.jsx               (all components, monolithic by design)
|       |-- styles.css
|-- template.yaml                 (SAM IaC, all AWS resources defined here)
```

All React components live in a single `App.jsx`. This was a deliberate choice for development speed on a solo project. In production the right approach would be separate component files, React Router for navigation, and custom hooks for API calls.

---


## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create patient, generate sequential ID |
| GET | `/patients/{id}` | Get patient by ID |
| POST | `/prescriptions` | Create prescription with TransactWriteItems |
| GET | `/prescriptions/patient/{id}` | Get prescription history for patient |
| GET | `/prescriptions?status=pending` | Get pharmacy queue |
| PATCH | `/prescriptions/{id}` | Mark dispensed and trigger SES email |

---

## 🚀 Local Setup

**Prerequisites:** Node.js 18+, AWS CLI configured, AWS SAM CLI

```bash
# Clone
git clone https://github.com/ManjunathAnde/CareScript.git
cd clinic-platform

# Deploy backend
sam build
sam deploy --guided

# Run frontend
cd frontend
npm install
npm run dev
```

**DynamoDB bootstrap:** After first deployment, create the COUNTER item in the ClinicPatients table via the AWS Console.

Go to DynamoDB, open ClinicPatients, click Create item, and add:
```json
{ "patient_id": "COUNTER", "last_id": 0 }
```

Without this item, patient creation will fail as the Lambda has nothing to increment.

---

## 🛣️ Phase 2 Roadmap

- **Patient portal** — patients log in with their ID to view their own prescription history and download records
- **DynamoDB Streams + SQS** — replace polling with event-driven pharmacy notifications for instant updates
- **SES production access** — send to any patient email without manual verification
- **Implement authentication** — Create proper role-based auth
- **Multi-clinic support** — tenant isolation per clinic with separate DynamoDB partitions

---

## 📝 Notes

- SES is running in sandbox mode. Email notifications work to verified addresses. Production use requires SES production access approval from AWS.
- The entire backend infrastructure is defined in `template.yaml` via AWS SAM. A fresh deployment from scratch requires only `sam deploy --guided`.

---

*Built by Manjunath Ande · [LinkedIn](https://www.linkedin.com/in/manjunath-ande/) · [GitHub](https://github.com/ManjunathAnde)*
