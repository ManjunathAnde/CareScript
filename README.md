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

Small clinics in India run prescription workflows entirely on paper. The consequences are felt by everyone involved.

### 🧑‍⚕️ Patients cannot read their own prescriptions
Medical abbreviations, handwritten dosage instructions, and clinical shorthand leave patients uncertain about what they are taking and why. This gap in awareness leads to incorrect self-medication, missed doses, and avoidable follow-up visits that clog the queue further.

### 📄 Lost prescriptions create clinical risk
Elderly patients and those managing chronic conditions frequently misplace physical prescriptions. Without a digital record, they cannot accurately recall their medication history when consulting a doctor months later. For patients on long-term medication, this is not an inconvenience but a genuine safety concern.

### 👨‍⚕️ The doctor has no visibility after the consultation ends
Once a prescription leaves the room, the doctor has no way of knowing whether it was dispensed, delayed, or lost entirely. There is no feedback loop between consultation and pharmacy.

### 📊 Clinic and pharmacy owners have no transaction record
Dispensing activity is untracked. There is no record of what was dispensed, when, or to whom, making inventory management, billing reconciliation, and any form of business reporting impossible.

### 📧 Patients receive no notification when medicines are ready
A patient who has been waiting has no way of knowing their prescription status. They either wait indefinitely at the counter or make an unnecessary return visit.

CareScript digitizes this entire workflow in a single connected platform, from patient registration to prescription creation to pharmacy dispensing to patient email notification.

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
