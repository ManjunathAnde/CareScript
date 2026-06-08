import { useState } from 'react';
import {
  ChevronDown,
  Check,
  ClipboardPlus,
  FileText,
  Home,
  PackagePlus,
  Plus,
  Search,
  Save,
  Trash2,
  User,
  UserPlus,
  Users,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Home, active: true, href: '/' },
  { label: 'Patients', icon: Users, href: '/patients/search' },
];

function Logo() {
  return (
    <div className="logo-wrap">
      <div className="logo-mark">
        <span className="heart left" />
        <span className="heart right" />
        <span className="pulse-line" />
      </div>
      <span className="logo-text">CareScript</span>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <Logo />

      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, active, href }) => (
          <a className={`nav-item ${active ? 'active' : ''}`} href={href} key={label}>
            <Icon size={21} strokeWidth={active ? 3 : 2.4} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="doctor-card">
        <div className="avatar">PC</div>
        <div className="doctor-copy">
          <div className="doctor-row">
            <strong>PrimeCare Health</strong>
            <ChevronDown size={16} strokeWidth={2.6} />
          </div>
          <span>General Physician</span>
          <div className="status-row">
            <span className="online-dot" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HeroMedicalVisual() {
  return (
    <div className="hero-visual" aria-label="Medical workspace visual">
      <img
        src="/hero-medical.png"
        alt=""
        className="hero-image"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.nextElementSibling?.classList.add('show');
        }}
      />
      <div className="hero-placeholder">
        <div className="bokeh one" />
        <div className="bokeh two" />
        <div className="bokeh three" />
        <div className="clipboard">
          <div className="clip" />
          <div className="paper-lines">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="pen" />
          <div className="stethoscope">
            <span className="chest" />
            <span className="tube" />
            <span className="tube second" />
          </div>
        </div>
        <span className="asset-note">Place hero-medical.png here</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <header className="hero-section dashboard-hero-clean">
      <div className="hero-copy">
        <p>Hello</p>
        <h1>Doc.</h1>
      </div>
      <HeroMedicalVisual />
    </header>
  );
}

function PageHero({ title, subtitle }) {
  return (
    <header className="page-hero">
      <div className="page-heading">
        <div className="breadcrumbs">
          <span>Dashboard</span>
          <span className="crumb-separator">›</span>
          <span>{title}</span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <HeroMedicalVisual />
    </header>
  );
}

function ActionCard({ variant, icon: Icon, title, body, button, buttonIcon: ButtonIcon, href }) {
  return (
    <article className={`action-card ${variant}`}>
      <div className="action-icon">
        <Icon size={44} strokeWidth={2.15} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <button type="button" className="action-button" onClick={() => { window.location.href = href; }}>
        <ButtonIcon size={21} strokeWidth={2.35} />
        <span>{button}</span>
      </button>
    </article>
  );
}

function Sparkline({ tone }) {
  return (
    <svg className={`sparkline ${tone}`} viewBox="0 0 180 92" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-fill-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.27" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M2 80 C18 55 32 75 48 66 C66 56 68 30 90 27 C112 24 112 50 134 22 C148 4 164 -6 178 12 L178 92 L2 92 Z"
        fill={`url(#spark-fill-${tone})`}
      />
      <path
        d="M2 80 C18 55 32 75 48 66 C66 56 68 30 90 27 C112 24 112 50 134 22 C148 4 164 -6 178 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetricCard({ tone, icon: Icon, value, label }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">
        <Icon size={35} strokeWidth={2.35} />
      </div>
      <div className="metric-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <Sparkline tone={tone} />
    </article>
  );
}

function PharmacySection() {
  return (
    <section className="pharmacy-section">
      <h3>Pharmacy</h3>
      <div className="section-rule" />
      <div className="metrics-grid">
        <MetricCard tone="violet" icon={Users} value="24" label="Patients Seen Today" />
        <MetricCard tone="teal" icon={PackagePlus} value="18" label="Prescriptions Dispensed" />
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PatientForm({ name, age, gender, onNameChange, onAgeChange, onGenderChange, onSave, loading, error }) {
  return (
    <section className="form-card patient-form-card">
      <div className="form-card-heading">
        <div className="form-card-icon violet">
          <UserPlus size={32} strokeWidth={2.25} />
        </div>
        <div>
          <h2>Patient Details</h2>
          <p>Enter the basic information of the patient.</p>
        </div>
      </div>

      <div className="patient-fields">
        <Field label="Patient Name">
          <input
            type="text"
            placeholder="Enter patient name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </Field>
        <Field label="Age">
          <input
            type="number"
            min="0"
            placeholder="Enter age"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
          />
        </Field>
        <Field label="Gender">
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
          >
            <option value="" disabled>Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button
        className="wide-button purple"
        type="button"
        onClick={onSave}
        disabled={loading}
      >
        <Save size={17} strokeWidth={2.2} />
        <span>{loading ? 'Saving...' : 'Save Patient'}</span>
      </button>
    </section>
  );
}

function SuccessSection({ patientId }) {
  return (
    <section className="success-card">
      <div className="success-icon">
        <Check size={48} strokeWidth={3.2} />
      </div>
      <div className="success-copy">
        <h2>Patient Created Successfully!</h2>
        <span>Generated Patient ID</span>
        <strong>{patientId || 'Pending'}</strong>
        <p>Share this ID with the patient</p>
      </div>
    </section>
  );
}

function PrescriptionForm({ patientId, title = 'Add Prescription' }) {
  const [medications, setMedications] = useState([{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedPrescription, setSavedPrescription] = useState(null);

  const handleMedicationChange = (id, field, value) => {
    setSavedPrescription(null);
    setMedications((current) =>
      current.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleAddRow = () => {
    setSavedPrescription(null);
    setMedications((current) => [...current, { id: crypto.randomUUID(), name: '', dosage: '', frequency: '' }]);
  };

  const handleRemoveRow = (id) => {
    setSavedPrescription(null);
    setMedications((current) => current.filter((med) => med.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!patientId) {
      setError('No patient selected.');
      return;
    }

    const trimmed = medications.map((med) => ({
      name: med.name.trim(),
      dosage: med.dosage.trim(),
      frequency: med.frequency.trim(),
    }));

    if (trimmed.some((med) => !med.name || !med.dosage || !med.frequency)) {
      setError('Every medication must have a name, dosage, and frequency.');
      return;
    }

    setSavedPrescription(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, medications: trimmed }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // response body was not valid JSON
      }

      if (!response.ok) {
        setError(data.error || 'Failed to save prescription.');
        return;
      }

      setMedications([{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '' }]);
      setSavedPrescription({ prescription_id: data.prescription_id, status: data.status });
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card prescription-card">
      <div className="form-card-heading">
        <div className="form-card-icon violet">
          <ClipboardPlus size={29} strokeWidth={2.25} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{title === 'Add Prescription' ? 'Add medications for this patient.' : 'Add new medications for this patient.'}</p>
        </div>
      </div>

      <div className="medication-list">
        {medications.map((med) => (
          <div className="medication-row" key={med.id}>
            <Field label="Medication Name">
              <input
                type="text"
                placeholder="Enter medication"
                value={med.name}
                onChange={(e) => handleMedicationChange(med.id, 'name', e.target.value)}
              />
            </Field>
            <Field label="Dosage">
              <input
                type="text"
                placeholder="Enter dosage"
                value={med.dosage}
                onChange={(e) => handleMedicationChange(med.id, 'dosage', e.target.value)}
              />
            </Field>
            <Field label="Frequency">
              <input
                type="text"
                placeholder="Enter frequency"
                value={med.frequency}
                onChange={(e) => handleMedicationChange(med.id, 'frequency', e.target.value)}
              />
            </Field>
            <button
              className="delete-medication"
              type="button"
              aria-label="Remove medication"
              disabled={medications.length === 1}
              onClick={() => handleRemoveRow(med.id)}
            >
              <Trash2 size={18} strokeWidth={2.1} />
            </button>
          </div>
        ))}
      </div>

      <button
        className="add-medication"
        type="button"
        onClick={handleAddRow}
      >
        <Plus size={18} strokeWidth={2.4} />
        <span>Add Another Medication</span>
      </button>

      {error && <p className="form-error">{error}</p>}

      {savedPrescription && (
        <div className="form-success">
          <Check size={16} strokeWidth={2.8} />
          <div>
            <strong>Prescription saved</strong>
            <span>Sent to pharmacy ✓</span>
          </div>
        </div>
      )}

      <button
        className="wide-button green"
        type="button"
        onClick={handleSavePrescription}
        disabled={loading}
      >
        <Save size={17} strokeWidth={2.2} />
        <span>{loading ? 'Saving...' : 'Save Prescription'}</span>
      </button>
    </section>
  );
}

function PatientProfile({ patient }) {
  const details = [
    ['Patient Name', patient?.name || 'No patient selected'],
    ['Age', patient?.age || '--'],
    ['Gender', patient?.gender || '--'],
    ['Visit Count', patient?.visitCount || '--'],
  ];

  return (
    <section className="form-card profile-card">
      <div className="form-card-heading">
        <div className="form-card-icon teal">
          <User size={29} strokeWidth={2.25} />
        </div>
        <div>
          <h2>Patient Profile</h2>
          <p>Patient details and visit summary.</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-icon">
          <Users size={30} strokeWidth={2.25} />
        </div>
        {details.map(([label, value]) => (
          <div className="profile-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrescriptionHistory() {
  return (
    <section className="form-card history-card">
      <div className="form-card-heading">
        <div className="form-card-icon violet small">
          <FileText size={24} strokeWidth={2.25} />
        </div>
        <div>
          <h2>Prescription History</h2>
          <p>View all past prescriptions for this patient.</p>
        </div>
      </div>

      <div className="history-table">
        <div className="history-head">
          <span>Date</span>
          <span>Medications</span>
          <span>Status</span>
        </div>
        <div className="history-empty">
          <span>No prescription history available.</span>
        </div>
      </div>
    </section>
  );
}

const API_BASE = 'https://g4uxubu6x0.execute-api.us-east-1.amazonaws.com/dev';

function AddNewPatientPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(false);
  const [patientId, setPatientId] = useState('');

  const handleSavePatient = async () => {
    const trimmedName = name.trim();
    const numericAge = Number(age);

    if (!trimmedName) {
      setError('Patient name is required.');
      return;
    }
    if (!numericAge || numericAge <= 0) {
      setError('Age must be a positive number.');
      return;
    }
    if (!gender) {
      setError('Please select a gender.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, age: numericAge, gender }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // response body was not valid JSON
      }

      if (!response.ok) {
        setError(data.error || 'Failed to save patient.');
        return;
      }

      setName('');
      setAge('');
      setGender('');
      setPatientId(data.patient_id);
      setCreated(true);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="dashboard-frame page-frame">
        <Sidebar />
        <section className="content page-content">
          <PageHero title="Add New Patient" subtitle="Enter patient details to create a new patient record." />
          <div className="page-stack">
            <PatientForm
              name={name}
              age={age}
              gender={gender}
              onNameChange={setName}
              onAgeChange={setAge}
              onGenderChange={setGender}
              onSave={handleSavePatient}
              loading={loading}
              error={error}
            />
            {created && <SuccessSection patientId={patientId} />}
            {created && <PrescriptionForm patientId={patientId} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function ExistingPatientPage() {
  const [found, setFound] = useState(false);

  return (
    <main className="app-shell">
      <div className="dashboard-frame page-frame">
        <Sidebar />
        <section className="content page-content">
          <PageHero title="Existing Patient" subtitle="Search for an existing patient and view their records." />
          <div className="page-stack">
            <section className="form-card search-card">
              <div className="form-card-heading">
                <div className="form-card-icon teal">
                  <Users size={31} strokeWidth={2.25} />
                </div>
                <div>
                  <h2>Search Patient</h2>
                  <p>Enter the patient ID to find their records.</p>
                </div>
              </div>

              <div className="search-row">
                <Field label="Patient ID">
                  <input type="text" placeholder="Enter patient ID" />
                </Field>
                <button className="find-button" type="button" onClick={() => setFound(true)}>
                  <Search size={19} strokeWidth={2.3} />
                  <span>Find Patient</span>
                </button>
              </div>
            </section>

            {found && <PatientProfile />}
            {found && <PrescriptionHistory />}
            {found && <PrescriptionForm title="Add New Prescription" />}
          </div>
        </section>
      </div>
    </main>
  );
}

function App() {
  const route = window.location.pathname;

  if (route === '/patients/new') {
    return <AddNewPatientPage />;
  }

  if (route === '/patients/search') {
    return <ExistingPatientPage />;
  }

  return (
    <main className="app-shell">
      <div className="dashboard-frame">
        <Sidebar />
        <section className="content">
          <HeroSection />
          <div className="actions-grid">
            <ActionCard
              variant="violet"
              icon={UserPlus}
              title="Add New Patient"
              body="Register a new patient and create their health record"
              button="Add New Patient"
              buttonIcon={Plus}
              href="/patients/new"
            />
            <ActionCard
              variant="teal"
              icon={Users}
              title="Existing Patient"
              body="Search for an existing patient and view their health records"
              button="Find Existing Patient"
              buttonIcon={Search}
              href="/patients/search"
            />
          </div>
          <PharmacySection />
        </section>
      </div>
    </main>
  );
}

export default App;
