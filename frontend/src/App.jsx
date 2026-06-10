import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  CheckCircle,
  ClipboardList,
  ClipboardPlus,
  Eye,
  EyeOff,
  FileText,
  Home,
  Lock,
  LogIn,
  LogOut,
  PackagePlus,
  Plus,
  Search,
  Save,
  Stethoscope,
  Trash2,
  User,
  UserPlus,
  Users,
} from 'lucide-react';

const logoutRef = { current: null };

const navItems = [
  { label: 'Dashboard', icon: Home, active: true, href: '/' },
  { label: 'Patients', icon: Users, href: '/patients/search' },
];

const pharmacyNavItems = [
  { label: 'Dashboard',             icon: Home,          active: true },
  { label: 'Pending Prescriptions', icon: ClipboardList               },
  { label: 'Dispensed',             icon: CheckCircle                 },
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
          <button
            className="sidebar-logout"
            type="button"
            onClick={() => logoutRef.current?.()}
          >
            <LogOut size={14} strokeWidth={2.3} />
            <span>Sign Out</span>
          </button>
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
    ['Visit Count', patient?.visit_count || '--'],
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

function PrescriptionHistory({ prescriptions = [], loading = false, error = null }) {
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

        {loading && (
          <div className="history-empty">
            <span>Loading prescription history…</span>
          </div>
        )}

        {!loading && error && (
          <div className="history-empty">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="history-empty">
            <span>No prescription history available.</span>
          </div>
        )}

        {!loading && !error && prescriptions.map((rx) => (
          <div className="history-row" key={rx.prescription_id}>
            <span>{new Date(rx.created_at).toLocaleDateString()}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {rx.medications.map((med, i) => (
                <span key={i}>{med.name} ({med.dosage}, {med.frequency})</span>
              ))}
            </div>
            <span className={`status-badge ${rx.status}`}>{rx.status}</span>
          </div>
        ))}
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
  const [searchInput, setSearchInput] = useState('');
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const searchGenRef = useRef(0);

  const handleFindPatient = async () => {
    const patientId = searchInput.trim().toUpperCase();

    if (patientId === '') {
      setPatientError('Please enter a patient ID.');
      return;
    }

    const gen = (searchGenRef.current += 1);

    setPatient(null);
    setPatientError(null);
    setPrescriptions([]);
    setHistoryError(null);
    setHistoryLoading(false);
    setPatientLoading(true);

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}`);

      let data = {};
      try { data = await response.json(); } catch {}

      if (gen !== searchGenRef.current) return;

      if (!response.ok) {
        setPatientError(response.status === 404 ? 'Patient not found.' : (data.error || 'Failed to load patient.'));
        return;
      }

      setPatient(data);
      setHistoryLoading(true);

      try {
        const histResponse = await fetch(`${API_BASE}/prescriptions/patient/${data.patient_id}`);

        let histData = [];
        try { histData = await histResponse.json(); } catch {}

        if (gen !== searchGenRef.current) return;

        if (!histResponse.ok) {
          setHistoryError(histData.error || 'Failed to load prescription history.');
        } else {
          setPrescriptions(histData);
        }
      } catch {
        if (gen !== searchGenRef.current) return;
        setHistoryError('Network error loading prescription history.');
      } finally {
        if (gen === searchGenRef.current) setHistoryLoading(false);
      }

    } catch {
      if (gen !== searchGenRef.current) return;
      setPatientError('Network error. Please check your connection.');
    } finally {
      if (gen === searchGenRef.current) setPatientLoading(false);
    }
  };

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
                  <input
                    type="text"
                    placeholder="Enter patient ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </Field>
                <button
                  className="find-button"
                  type="button"
                  onClick={handleFindPatient}
                  disabled={patientLoading}
                >
                  <Search size={19} strokeWidth={2.3} />
                  <span>{patientLoading ? 'Searching…' : 'Find Patient'}</span>
                </button>
              </div>

              {patientError && <p className="form-error">{patientError}</p>}
            </section>

            {patient && <PatientProfile patient={patient} />}
            {patient && <PrescriptionHistory prescriptions={prescriptions} loading={historyLoading} error={historyError} />}
            {patient && <PrescriptionForm patientId={patient.patient_id} title="Add New Prescription" />}
          </div>
        </section>
      </div>
    </main>
  );
}

function PharmacySidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <Logo />

      <nav className="nav-list" aria-label="Pharmacy navigation">
        {pharmacyNavItems.map(({ label, icon: Icon, active }) => (
          <div className={`nav-item ${active ? 'active' : ''}`} key={label}>
            <Icon size={21} strokeWidth={active ? 3 : 2.4} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="pharmacy-sidebar-bottom">
        <div className="pharmacy-profile-card">
          <div className="avatar teal">PC</div>
          <div className="doctor-copy">
            <div className="doctor-row">
              <strong>PrimeCare Pharmacy</strong>
              <ChevronDown size={16} strokeWidth={2.6} />
            </div>
            <span>Pharmacist</span>
            <div className="status-row">
              <span className="online-dot" />
              <span>Online</span>
            </div>
          </div>
        </div>
        <button className="pharmacy-signout-btn" type="button" onClick={onLogout}>
          <LogOut size={15} strokeWidth={2.3} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function PharmacyHero() {
  return (
    <header className="pharmacy-hero">
      <h1 className="pharmacy-hero-title">Hello, Pharmacist 👋</h1>
      <p className="pharmacy-hero-subtitle">Manage and dispense prescription requests</p>
    </header>
  );
}

function DispenseConfirmModal({ prescription, emailAddress, onEmailChange, onConfirm, onCancel, isDispensing }) {
  if (!prescription) return null;
  const rxShortId = `RX-${prescription.prescription_id.slice(0, 8).toUpperCase()}`;
  return (
    <div className="dispense-modal-overlay">
      <div className="dispense-modal">
        <div className="dispense-modal-header">
          <h2 className="dispense-modal-title">Confirm Dispense</h2>
        </div>
        <div className="dispense-modal-body">
          <div className="dispense-modal-patient">
            <div className="dispense-modal-row">
              <span className="dispense-modal-label">Patient Name</span>
              <span className="dispense-modal-value">{prescription.patient_name || '—'}</span>
            </div>
            <div className="dispense-modal-row">
              <span className="dispense-modal-label">Patient ID</span>
              <span className="dispense-modal-value">{prescription.patient_id || '—'}</span>
            </div>
            <div className="dispense-modal-row">
              <span className="dispense-modal-label">Prescription ID</span>
              <span className="dispense-modal-value">{rxShortId}</span>
            </div>
          </div>
          <div className="dispense-modal-phone">
            <label htmlFor="modal-email">Patient Email (Optional)</label>
            <input
              id="modal-email"
              type="email"
              placeholder="patient@example.com"
              value={emailAddress}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          <div className="dispense-modal-actions">
            <button className="modal-cancel-btn" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="modal-confirm-btn"
              type="button"
              onClick={onConfirm}
              disabled={isDispensing}
            >
              {isDispensing ? 'Dispensing…' : 'Confirm Dispense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyPrescriptionTable({ prescriptions, loading, error, dispensingIds, dispenseErrors, onSelectDispense, onRetry }) {
  return (
    <section className="rx-table-wrap">
      <div className="rx-table-header">
        <h2 className="rx-table-title">Pending Prescriptions</h2>
        <p className="rx-table-subtitle">Prescriptions waiting to be dispensed</p>
      </div>

      <div className="rx-table">
        <div className="rx-table-head">
          <span>Prescription ID</span>
          <span>Patient</span>
          <span>Age</span>
          <span>Medications</span>
          <span>Prescribed On</span>
          <span>Actions</span>
        </div>

        {loading && (
          <div className="rx-empty">
            <span>Loading prescriptions…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rx-error">
            <span>{error}</span>
            <button className="rx-retry-btn" type="button" onClick={onRetry}>Retry</button>
          </div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="rx-empty">
            <span>No pending prescriptions.</span>
          </div>
        )}

        {!loading && !error && prescriptions.map((rx) => {
          const date = new Date(rx.created_at);
          const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const rxShortId = `RX-${rx.prescription_id.slice(0, 8).toUpperCase()}`;
          const isDispensing = dispensingIds.has(rx.prescription_id);

          return (
            <div className="rx-table-row" key={rx.prescription_id}>
              <span className="rx-cell-id">{rxShortId}</span>
              <div className="rx-cell-patient">
                <strong>{rx.patient_name || 'Unknown'}</strong>
                <span>{rx.patient_id || '—'}</span>
              </div>
              <span className="rx-cell-age">{rx.patient_age ?? '—'}</span>
              <div className="rx-cell-meds">
                {Array.isArray(rx.medications) && rx.medications.map((med, i) => (
                  <span key={i}>{med.name} {med.dosage} ({med.frequency})</span>
                ))}
              </div>
              <div className="rx-cell-time">
                <span className="rx-cell-time-date">{dateStr}</span>
                <span className="rx-cell-time-clock">{timeStr}</span>
              </div>
              <div className="rx-cell-actions">
                {dispenseErrors[rx.prescription_id] && (
                  <span className="rx-dispense-error">{dispenseErrors[rx.prescription_id]}</span>
                )}
                <button
                  className="dispense-btn"
                  type="button"
                  disabled={isDispensing}
                  onClick={() => onSelectDispense(rx)}
                >
                  <PackagePlus size={14} strokeWidth={2.2} />
                  <span>{isDispensing ? 'Dispensing…' : 'Dispense'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim() !== '' && password.trim() !== '';

  const handleSignIn = () => {
    setError(null);
    setLoading(true);

    if (selectedRole === 'doctor' && username === 'doctor' && password === 'carescript123') {
      onLogin('doctor');
    } else if (selectedRole === 'pharmacy' && username === 'pharmacy' && password === 'carescript456') {
      onLogin('pharmacy');
    } else {
      setError('Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-form-panel">
          <div className="login-logo">
            <Logo />
          </div>

          <h2 className="login-heading">Welcome back</h2>
          <p className="login-subheading">Sign in to access your portal</p>

          <div className="login-fields">
            <label className="form-field">
              <span>Username</span>
              <div className="login-input-wrap">
                <User size={16} strokeWidth={2.2} className="login-input-icon-left" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => { setError(null); setUsername(e.target.value); }}
                />
              </div>
            </label>

            <label className="form-field">
              <span>Password</span>
              <div className="login-input-wrap login-input-has-right-icon">
                <Lock size={16} strokeWidth={2.2} className="login-input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setError(null); setPassword(e.target.value); }}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2.2} /> : <Eye size={16} strokeWidth={2.2} />}
                </button>
              </div>
            </label>

            <div>
              <span className="login-role-label">Sign in as</span>
              <div className="role-cards">
                <button
                  type="button"
                  className={`role-card ${selectedRole === 'doctor' ? 'selected' : ''}`}
                  onClick={() => { setError(null); setSelectedRole('doctor'); }}
                >
                  <div className="role-radio">
                    {selectedRole === 'doctor' && <span className="role-radio-dot" />}
                  </div>
                  <Stethoscope size={28} strokeWidth={2} className="role-icon-violet" />
                  <strong>Doctor Portal</strong>
                  <span>Access patient records and manage prescriptions</span>
                </button>

                <button
                  type="button"
                  className={`role-card ${selectedRole === 'pharmacy' ? 'selected' : ''}`}
                  onClick={() => { setError(null); setSelectedRole('pharmacy'); }}
                >
                  <div className="role-radio">
                    {selectedRole === 'pharmacy' && <span className="role-radio-dot" />}
                  </div>
                  <PackagePlus size={28} strokeWidth={2} className="role-icon-teal" />
                  <strong>Pharmacy Portal</strong>
                  <span>View and manage prescription requests</span>
                </button>
              </div>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="wide-button purple login-submit"
            type="button"
            onClick={handleSignIn}
            disabled={!canSubmit || loading}
          >
            <LogIn size={18} strokeWidth={2.2} />
            <span>{loading ? 'Signing in…' : 'Sign In'}</span>
          </button>

          <div className="login-secure">
            <Lock size={13} strokeWidth={2.4} />
            <span>Secure and private access</span>
          </div>
        </div>

        <div className="login-visual-panel">
          <div className="login-visual-scene">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyDashboard({ onLogout }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispensingIds, setDispensingIds] = useState(new Set());
  const [dispenseErrors, setDispenseErrors] = useState({});
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const isMountedRef = useRef(true);
  const activeDispensesRef = useRef(0);

  const fetchPending = async (isInitial) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/prescriptions?status=pending`);
      let data = [];
      try { data = await res.json(); } catch {}
      if (!isMountedRef.current) return;
      if (res.ok) {
        setPrescriptions(Array.isArray(data) ? data : []);
        if (isInitial) setError(null);
      } else {
        if (isInitial) setError((data && data.error) || 'Failed to load prescriptions.');
      }
    } catch {
      if (!isMountedRef.current) return;
      if (isInitial) setError('Network error. Please check your connection.');
    } finally {
      if (isMountedRef.current && isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchPending(true);
    const interval = setInterval(() => {
      if (activeDispensesRef.current > 0) return;
      fetchPending(false);
    }, 15000);
    return () => {
      clearInterval(interval);
      isMountedRef.current = false;
    };
  }, []);

  const handleDispense = async (prescriptionId, email = '') => {
    activeDispensesRef.current += 1;
    setDispensingIds((prev) => {
      const next = new Set(prev);
      next.add(prescriptionId);
      return next;
    });
    setDispenseErrors((prev) => {
      const next = { ...prev };
      delete next[prescriptionId];
      return next;
    });
    try {
      const res = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dispensed', email }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!isMountedRef.current) return;
      if (res.ok) {
        setPrescriptions((prev) => prev.filter((rx) => rx.prescription_id !== prescriptionId));
        return true;
      } else {
        setDispenseErrors((prev) => ({ ...prev, [prescriptionId]: data.error || 'Failed to dispense. Please try again.' }));
        return false;
      }
    } catch {
      if (!isMountedRef.current) return;
      setDispenseErrors((prev) => ({ ...prev, [prescriptionId]: 'Network error. Please try again.' }));
      return false;
    } finally {
      if (isMountedRef.current) {
        setDispensingIds((prev) => {
          const next = new Set(prev);
          next.delete(prescriptionId);
          return next;
        });
      }
      activeDispensesRef.current -= 1;
    }
  };

  const handleOpenModal = (rx) => {
    setSelectedPrescription(rx);
  };

  const handleCancelModal = () => {
    setSelectedPrescription(null);
    setEmailAddress('');
  };

  const handleConfirmDispense = async () => {
    console.log(emailAddress);
    const succeeded = await handleDispense(selectedPrescription.prescription_id, emailAddress);
    if (succeeded) {
      setSelectedPrescription(null);
      setEmailAddress('');
    }
  };

  return (
    <main className="app-shell">
      <div className="dashboard-frame">
        <PharmacySidebar onLogout={onLogout} />
        <section className="content pharmacy-content">
          <PharmacyHero />
          <DispenseConfirmModal
            prescription={selectedPrescription}
            emailAddress={emailAddress}
            onEmailChange={setEmailAddress}
            onConfirm={handleConfirmDispense}
            onCancel={handleCancelModal}
            isDispensing={selectedPrescription ? dispensingIds.has(selectedPrescription.prescription_id) : false}
          />
          <PharmacyPrescriptionTable
            prescriptions={prescriptions}
            loading={loading}
            error={error}
            dispensingIds={dispensingIds}
            dispenseErrors={dispenseErrors}
            onSelectDispense={handleOpenModal}
            onRetry={() => fetchPending(true)}
          />
        </section>
      </div>
    </main>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('carescript-role')
  );
  const [role, setRole] = useState(
    () => localStorage.getItem('carescript-role') || null
  );

  function handleLogout() {
    localStorage.removeItem('carescript-role');
    window.history.replaceState({}, '', '/');
    setIsAuthenticated(false);
    setRole(null);
  }

  useEffect(() => {
    logoutRef.current = handleLogout;
    return () => { logoutRef.current = null; };
  }, []);

  const handleLogin = (selectedRole) => {
    localStorage.setItem('carescript-role', selectedRole);
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (role === 'pharmacy') {
    return <PharmacyDashboard onLogout={handleLogout} />;
  }

  const route = window.location.pathname.replace(/\/$/, '') || '/';

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
