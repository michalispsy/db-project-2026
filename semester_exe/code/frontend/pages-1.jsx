/* Pages: Dashboard, Triage, Patients, Beds — part 1 */

const P1_DEPARTMENTS = window.UG.DEPARTMENTS;
const P1_PATIENTS_TRIAGE = window.UG.PATIENTS_TRIAGE;
const P1_PATIENTS = window.UG.PATIENTS;
const P1_BEDS = window.UG.BEDS;

/* ─────────── DASHBOARD ─────────── */
const Dashboard = () => (
  <div>
    <PageHeader
      title="Καλωσορίσατε, Ελένη"
      subtitle={"Σύνοψη λειτουργίας — " + new Date().toLocaleDateString("el-GR", {weekday: "long", day: "numeric", month: "long", year: "numeric"})}
      actions={<>
        <button className="btn btn-ghost"><Icon name="download" size={14}/>Εξαγωγή</button>
        <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Νοσηλεία</button>
      </>}
    />
    <div className="stat-grid">
      <div className="stat">
        <div className="stat-label">Ασθενείς σε νοσηλεία</div>
        <div className="stat-value">142</div>
        <div className="stat-meta"><span className="delta-up">▲ 4</span><span className="muted">από χθες</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Triage σε αναμονή</div>
        <div className="stat-value">13</div>
        <div className="stat-meta"><span style={{color:"var(--red-500)"}}>● 2 επίπεδο 1</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Διαθέσιμες κλίνες</div>
        <div className="stat-value">36 / 168</div>
        <div className="stat-meta"><span className="muted">21% πληρότητα</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Χειρουργεία σήμερα</div>
        <div className="stat-value">9</div>
        <div className="stat-meta"><span className="muted">2 έκτακτα</span></div>
      </div>
    </div>

    <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16}}>
      <div className="card" style={{padding: 18}}>
        <div className="hstack" style={{justifyContent:"space-between", marginBottom: 14}}>
          <div>
            <div style={{fontWeight: 600, fontSize: 14, color:"var(--ink-900)"}}>Πληρότητα ανά τμήμα</div>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Live δεδομένα · κλίνες σε χρήση / σύνολο</div>
          </div>
          <button className="btn btn-ghost" style={{padding:"4px 10px", fontSize:12}}>7 ημέρες</button>
        </div>
        {P1_DEPARTMENTS.slice(0, 6).map(d => {
          const used = Math.floor(d.beds * (0.55 + Math.random() * 0.4));
          const pct = Math.round(100 * used / d.beds);
          return (
            <div key={d.id} style={{display:"grid", gridTemplateColumns:"160px 1fr 80px", alignItems:"center", gap: 14, padding: "10px 0", borderBottom:"1px solid var(--ink-150)"}}>
              <div style={{fontSize: 13, fontWeight: 500}}>{d.name}</div>
              <div className="sev-bar"><div className="fill" style={{width: pct + "%", background: pct > 85 ? "var(--red-500)" : pct > 70 ? "var(--amber-500)" : "var(--brand-500)"}}/></div>
              <div className="mono" style={{fontSize: 12, textAlign:"right", color:"var(--ink-600)"}}>{used}/{d.beds} · {pct}%</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{padding: 18}}>
        <div style={{fontWeight: 600, fontSize: 14, color:"var(--ink-900)"}}>Ροή σήμερα</div>
        <div className="muted" style={{fontSize: 12, marginTop: 2, marginBottom: 14}}>Εισαγωγές, εξιτήρια, προσέλευσεις</div>
        {[
          { time: "08:38", text: "Εισαγωγή Δ. Ραπτόπουλος → Καρδιολογική", color: "var(--brand-700)" },
          { time: "08:25", text: "Έκτακτη χειρ. Α. Μαλλίδου ξεκίνησε", color: "var(--red-500)" },
          { time: "08:11", text: "Άφιξη triage Επ. 1: Α. Μαλλίδου", color: "var(--red-500)" },
          { time: "07:58", text: "Εξιτήριο Π. Παπαδόπουλος (Παθολογική)", color: "var(--green-600)" },
          { time: "07:42", text: "Άφιξη triage Επ. 1: Δ. Ραπτόπουλος", color: "var(--red-500)" },
          { time: "07:30", text: "Σ. Καραμίντα → προγρ. χειρουργείο", color: "var(--brand-700)" },
          { time: "07:15", text: "Παράδοση βάρδιας Καρδιολογικής", color: "var(--ink-500)" },
        ].map((row, i) => (
          <div key={i} style={{display:"flex", gap: 10, padding: "8px 0", fontSize: 12, borderBottom: i < 6 ? "1px solid var(--ink-150)" : "none"}}>
            <span className="mono" style={{color:"var(--ink-500)", minWidth: 38}}>{row.time}</span>
            <span style={{color: row.color, fontSize: 10}}>●</span>
            <span style={{color:"var(--ink-700)"}}>{row.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────── TRIAGE ─────────── */
const TRIAGE_LEVELS = [
  { lvl: 1, label: "Άμεση", color: "var(--t1)", desc: "Απειλητικό για τη ζωή" },
  { lvl: 2, label: "Επείγον", color: "var(--t2)", desc: "Εντός 10 λεπτών" },
  { lvl: 3, label: "Λιγότερο Επείγον", color: "var(--t3)", desc: "Εντός 30 λεπτών" },
  { lvl: 4, label: "Μη Επείγον", color: "var(--t4)", desc: "Εντός 60 λεπτών" },
  { lvl: 5, label: "Καθόλου Επείγον", color: "var(--t5)", desc: "Εντός 120 λεπτών" },
];

const Triage = ({ onAdmit }) => {
  const grouped = TRIAGE_LEVELS.map(l => ({...l, patients: P1_PATIENTS_TRIAGE.filter(p => p.level === l.lvl)}));
  return (
    <div>
      <PageHeader
        title="Επείγοντα — Διαλογή Triage"
        subtitle="Ζωντανή ροή. Σύρετε κάρτες ή χρησιμοποιήστε τις ενέργειες για εισαγωγή/εξιτήριο."
        actions={<>
          <button className="btn btn-ghost"><Icon name="alert" size={14}/>Πρωτόκολλο ESI</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Άφιξη</button>
        </>}
      />
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(5, 1fr)"}}>
        {grouped.map(g => (
          <div key={g.lvl} className="stat" style={{borderLeft: `3px solid ${g.color}`}}>
            <div className="stat-label">Επ. {g.lvl} · {g.label}</div>
            <div className="stat-value" style={{fontSize: 22}}>{g.patients.length}</div>
            <div className="stat-meta">{g.desc}</div>
          </div>
        ))}
      </div>
      <div className="triage-board">
        {grouped.map(g => (
          <div key={g.lvl} className="triage-col">
            <div className="triage-col-header">
              <div className="triage-col-title">
                <span className="level-badge" style={{background: g.color}}>{g.lvl}</span>
                {g.label}
              </div>
              <span className="chip">{g.patients.length}</span>
            </div>
            {g.patients.map(p => (
              <div key={p.id} className="triage-card" id={"triage-card-" + p.id} draggable>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom: 6}}>
                  <strong style={{fontSize: 13}}>{p.name}</strong>
                  <span className="mono" style={{fontSize: 10, color:"var(--ink-500)"}}>{p.arrival}</span>
                </div>
                <div style={{fontSize: 12, color:"var(--ink-600)", lineHeight: 1.4, marginBottom: 8}}>{p.symptoms}</div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span className={"chip " + (p.waitMin > g.lvl * 30 ? "chip-red" : p.waitMin > g.lvl * 15 ? "chip-amber" : "")}>
                    αναμ. {p.waitMin}′
                  </span>
                  <div style={{display:"flex", gap: 4}}>
                    <button className="icon-btn" style={{width: 24, height: 24}} title="Εξιτήριο" id={"discharge-" + p.id}>
                      <Icon name="check" size={12}/>
                    </button>
                    <button className="icon-btn" style={{width: 24, height: 24, background:"var(--brand-50)", color:"var(--brand-700)"}} title="Εισαγωγή" id={"admit-" + p.id} onClick={() => onAdmit && onAdmit(p)}>
                      <Icon name="hospital" size={12}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {g.patients.length === 0 && (
              <div style={{padding: 20, textAlign:"center", color:"var(--ink-400)", fontSize: 12}}>—</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── PATIENTS ─────────── */
const Patients = ({ onOpen }) => {
  const [q, setQ] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const filtered = P1_PATIENTS.filter(p =>
    !q || (p.first + " " + p.last + " " + p.amka).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <PageHeader
        title="Ασθενείς"
        subtitle={"Αρχείο ασθενών · " + P1_PATIENTS.length + " εγγραφές ορατές"}
        actions={<>
          <button className="btn btn-ghost"><Icon name="download" size={14}/>Εξαγωγή CSV</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέος Ασθενής</button>
        </>}
      />
      <div className="hstack" style={{marginBottom: 14, gap: 8}}>
        <div style={{position:"relative", flex: 1, maxWidth: 380}}>
          <Icon name="search" size={14} style={{position:"absolute", left: 10, top: 9, color:"var(--ink-400)"}}/>
          <input className="input" style={{paddingLeft: 32}} placeholder="Αναζήτηση κατά ΑΜΚΑ, όνομα, επώνυμο…" value={q} onChange={e => setQ(e.target.value)} id="patient-search-input"/>
        </div>
        <button className="btn btn-ghost">Φίλτρα</button>
        <div className="spacer"/>
        <span className="muted" style={{fontSize: 12}}>Ασφάλεια:</span>
        <select className="select" style={{width: 160}}>
          <option>Όλες</option><option>ΕΦΚΑ</option><option>Ιδιωτική</option><option>Ανασφάλιστος</option>
        </select>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>ΑΜΚΑ</th><th>Ονοματεπώνυμο</th><th>Ηλικία</th><th>Φύλο</th><th>Ασφάλεια</th><th>Αλλεργίες</th><th>Νοσηλείες</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => onOpen(p.id)} style={{cursor:"pointer"}} id={"patient-row-" + p.id}>
                <td className="mono" style={{color:"var(--ink-600)"}}>{p.amka}</td>
                <td><strong>{p.last}</strong> {p.first}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td><span className="chip">{p.insurance}</span></td>
                <td>
                  {p.allergies.length === 0 ? <span className="muted">—</span> :
                    <div style={{display:"flex", gap: 4, flexWrap:"wrap"}}>
                      {p.allergies.map(a => <span key={a} className="allergy-pill"><Icon name="alert" size={9}/>{a}</span>)}
                    </div>
                  }
                </td>
                <td>{p.hospitalizations.length}</td>
                <td><Icon name="chevronRight" size={14}/></td>
              </tr>
            ))}
            {Array(20).fill(0).map((_, i) => {
              const code = "P-" + (1200 + i);
              const names = [["Δημήτριος", "Παπαδόπουλος"], ["Μαρία", "Καρανίκα"], ["Ιωάννης", "Σπύρου"], ["Ελένη", "Λάππα"], ["Νίκος", "Βλάχος"], ["Σοφία", "Μάνου"], ["Παύλος", "Ζαφειρίου"], ["Άννα", "Καρρά"], ["Στέλιος", "Μήτσος"], ["Δέσποινα", "Πιτσίκα"]];
              const [first, last] = names[i % names.length];
              const age = 20 + ((i*7) % 65);
              const allergies = i % 4 === 0 ? ["Πενικιλλίνη"] : (i % 7 === 0 ? ["Λακτόζη"] : []);
              return (
                <tr key={code} style={{cursor:"pointer"}}>
                  <td className="mono" style={{color:"var(--ink-600)"}}>{(11000000000 + i * 73841).toString().slice(0,11)}</td>
                  <td><strong>{last}</strong> {first}</td>
                  <td>{age}</td>
                  <td>{i % 2 === 0 ? "Α" : "Γ"}</td>
                  <td><span className="chip">{i % 3 === 0 ? "Ιδιωτική" : "ΕΦΚΑ"}</span></td>
                  <td>
                    {allergies.length === 0 ? <span className="muted">—</span> :
                      <div style={{display:"flex", gap:4}}>{allergies.map(a => <span key={a} className="allergy-pill"><Icon name="alert" size={9}/>{a}</span>)}</div>
                    }
                  </td>
                  <td>{i % 5}</td>
                  <td><Icon name="chevronRight" size={14}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination">
          <span>Εμφάνιση 1–23 από 1.247</span>
          <div className="pages">
            <button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>…</button><button>54</button><button>›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── PATIENT DETAIL ─────────── */
const PatientDetail = ({ patientId, onBack }) => {
  const p = P1_PATIENTS.find(x => x.id === patientId) || P1_PATIENTS[0];
  const [tab, setTab] = React.useState("info");
  return (
    <div>
      <button className="btn btn-ghost" onClick={onBack} style={{marginBottom: 12}}><Icon name="chevronRight" size={12} style={{transform:"rotate(180deg)"}}/>Πίσω στους ασθενείς</button>
      <div className="card" style={{padding: 20, marginBottom: 16, display:"flex", gap: 18, alignItems:"center"}}>
        <div className="avatar avatar-lg" style={{width: 64, height: 64, fontSize: 22, background:"linear-gradient(135deg, var(--brand-700), var(--brand-500))"}}>{p.first[0]}{p.last[0]}</div>
        <div style={{flex: 1}}>
          <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 4}}>
            <h2 style={{margin: 0, fontSize: 20, letterSpacing:"-0.02em"}}>{p.last} {p.first}</h2>
            <span className="chip chip-brand mono">{p.id}</span>
            {p.allergies.length > 0 && <span className="chip chip-red"><Icon name="alert" size={10}/>Αλλεργίες</span>}
          </div>
          <div className="muted" style={{fontSize: 13}}>
            {p.age} ετών · {p.gender === "Α" ? "Άνδρας" : "Γυναίκα"} · ΑΜΚΑ <span className="mono">{p.amka}</span> · {p.insurance}
          </div>
        </div>
        <button className="btn btn-ghost"><Icon name="pill" size={14}/>Νέα Συνταγή</button>
        <button className="btn btn-primary"><Icon name="hospital" size={14}/>Νέα Νοσηλεία</button>
      </div>

      <div className="tabs">
        {[
          ["info","Πληροφορίες"],
          ["contacts","Οικεία πρόσωπα", p.contacts.length],
          ["allergies","Αλλεργίες", p.allergies.length],
          ["hosp","Νοσηλείες", p.hospitalizations.length],
          ["labs","Εργαστηριακά"],
          ["acts","Ιατρικές Πράξεις"],
        ].map(([id, label, count]) => (
          <div key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)} id={"patient-tab-" + id}>
            {label}
            {count != null && <span className="count">{count}</span>}
          </div>
        ))}
      </div>

      {tab === "info" && <PatientInfoTab p={p}/>}
      {tab === "contacts" && <PatientContactsTab p={p}/>}
      {tab === "allergies" && <PatientAllergiesTab p={p}/>}
      {tab === "hosp" && <PatientHospTab p={p}/>}
      {tab === "labs" && <PatientLabsTab p={p}/>}
      {tab === "acts" && <PatientActsTab p={p}/>}
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div style={{padding: "10px 0", borderBottom:"1px solid var(--ink-150)", display:"grid", gridTemplateColumns:"160px 1fr", gap: 12, alignItems:"center"}}>
    <div className="muted" style={{fontSize: 12}}>{label}</div>
    <div style={{fontSize: 13}} className={mono ? "mono" : ""}>{value}</div>
  </div>
);

const PatientInfoTab = ({ p }) => (
  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16}}>
    <div className="card" style={{padding: "4px 18px"}}>
      <div style={{fontWeight:600, fontSize: 13, padding:"14px 0 6px"}}>Στοιχεία ταυτότητας</div>
      <InfoRow label="ΑΜΚΑ" value={p.amka} mono/>
      <InfoRow label="Όνομα" value={p.first}/>
      <InfoRow label="Επώνυμο" value={p.last}/>
      <InfoRow label="Όνομα πατέρα" value={p.father}/>
      <InfoRow label="Ηλικία" value={p.age + " ετών"}/>
      <InfoRow label="Φύλο" value={p.gender === "Α" ? "Άνδρας" : "Γυναίκα"}/>
      <InfoRow label="Εθνικότητα" value={p.nationality}/>
    </div>
    <div className="card" style={{padding: "4px 18px"}}>
      <div style={{fontWeight:600, fontSize: 13, padding:"14px 0 6px"}}>Επικοινωνία & ασφάλεια</div>
      <InfoRow label="Διεύθυνση" value={p.address}/>
      <InfoRow label="Τηλέφωνο" value={p.phone} mono/>
      <InfoRow label="Email" value={p.email} mono/>
      <InfoRow label="Επάγγελμα" value={p.job}/>
      <InfoRow label="Ασφάλεια" value={<span className="chip chip-brand">{p.insurance}</span>}/>
      <InfoRow label="Βάρος" value={p.weight + " kg"}/>
      <InfoRow label="Ύψος" value={p.height + " cm"}/>
    </div>
  </div>
);

const PatientContactsTab = ({ p }) => (
  <div className="card">
    <table className="tbl">
      <thead><tr><th>Ονοματεπώνυμο</th><th>Τηλέφωνο</th><th></th></tr></thead>
      <tbody>
        {p.contacts.map((c, i) => (
          <tr key={i}><td>{c.name}</td><td className="mono">{c.phone}</td><td><Icon name="chevronRight" size={14}/></td></tr>
        ))}
        {p.contacts.length === 0 && <tr><td colSpan={3} style={{textAlign:"center", padding: 30, color:"var(--ink-400)"}}>Δεν έχουν καταχωρηθεί οικεία πρόσωπα.</td></tr>}
      </tbody>
    </table>
  </div>
);

const PatientAllergiesTab = ({ p }) => (
  <div>
    {p.allergies.length === 0 ? (
      <div className="alert info"><Icon name="check" size={16}/><div><strong>Καμία γνωστή αλλεργία.</strong>Δεν θα γίνονται προειδοποιήσεις σύγκρουσης κατά τη συνταγογράφηση.</div></div>
    ) : (
      <>
        <div className="alert danger" style={{marginBottom: 14}}>
          <Icon name="alert" size={16}/>
          <div><strong>Προσοχή — γνωστές αλλεργίες</strong>Οι παρακάτω δραστικές ουσίες θα μπλοκάρουν τη συνταγογράφηση φαρμάκων που τις περιέχουν.</div>
        </div>
        <div style={{display:"flex", gap: 8, flexWrap:"wrap"}}>
          {p.allergies.map(a => (
            <div key={a} style={{padding: "10px 14px", background:"var(--red-50)", border:"1px solid var(--red-100)", borderRadius:"var(--r-md)", display:"flex", gap:8, alignItems:"center"}}>
              <Icon name="alert" size={14} style={{color:"var(--red-500)"}}/>
              <strong style={{color:"var(--red-600)"}}>{a}</strong>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

const PatientHospTab = ({ p }) => (
  <div className="card">
    <table className="tbl">
      <thead><tr><th>ID</th><th>Από</th><th>Έως</th><th>Τμήμα</th><th>ICD-10</th><th>KEN</th><th>Κλίνη</th><th>Κόστος</th><th>Status</th></tr></thead>
      <tbody>
        {p.hospitalizations.map(h => (
          <tr key={h.id}>
            <td className="mono">{h.id}</td>
            <td className="mono">{h.from}</td>
            <td className="mono">{h.to || "—"}</td>
            <td>{h.dept}</td>
            <td className="mono">{h.icd10}</td>
            <td className="mono">{h.ken}</td>
            <td className="mono">{h.bed}</td>
            <td className="mono" style={{textAlign:"right"}}>{h.cost.toLocaleString("el-GR")} €</td>
            <td><span className={"chip " + (h.status === "ενεργή" ? "chip-amber" : "chip-green")}>{h.status}</span></td>
          </tr>
        ))}
        {p.hospitalizations.length === 0 && <tr><td colSpan={9} style={{textAlign:"center", padding: 30, color:"var(--ink-400)"}}>Καμία νοσηλεία.</td></tr>}
      </tbody>
    </table>
  </div>
);

const PatientLabsTab = ({ p }) => (
  <div className="card">
    <table className="tbl">
      <thead><tr><th>Κωδ.</th><th>Τύπος</th><th>Ημ/νία</th><th>Αποτέλεσμα</th><th>Μονάδα</th><th>Κόστος</th><th>Γιατρός</th></tr></thead>
      <tbody>
        {[
          ["LB-7821","Γενική αίματος","2026-04-13","WBC 11.2","×10⁹/L","18 €","Δ. Σαββίδης"],
          ["LB-7822","Τροπονίνη Ι","2026-04-13","0.42","ng/mL","32 €","Α. Παπαδημητρίου"],
          ["LB-7823","CRP","2026-04-13","48.5","mg/L","12 €","Α. Παπαδημητρίου"],
          ["LB-7901","ΗΚΓ 12 απαγωγών","2026-04-14","ST elevation V2-V4","—","—","Γ. Αντωνίου"],
          ["LB-7902","Ηχοκαρδιογράφημα","2026-04-15","EF 38%","—","85 €","Γ. Αντωνίου"],
        ].map(r => (
          <tr key={r[0]}>
            <td className="mono">{r[0]}</td><td>{r[1]}</td><td className="mono">{r[2]}</td><td><strong>{r[3]}</strong></td><td className="muted">{r[4]}</td><td className="mono">{r[5]}</td><td>{r[6]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PatientActsTab = ({ p }) => (
  <div className="card">
    <table className="tbl">
      <thead><tr><th>Κωδ.</th><th>Πράξη</th><th>Κατηγορία</th><th>Διάρκεια</th><th>Κόστος</th></tr></thead>
      <tbody>
        {[
          ["MA-3211","Στεφανιογραφία","Α — χειρουργική","45′","420 €"],
          ["MA-3212","Αγγειοπλαστική + stent","Α — χειρουργική","1h 30′","2.150 €"],
          ["MA-3301","Ηχοκαρδιογράφημα","Β — διαγνωστική","20′","85 €"],
          ["MA-3302","Holter ρυθμού 24h","Β — διαγνωστική","24h","65 €"],
        ].map(r => (
          <tr key={r[0]}><td className="mono">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="mono">{r[3]}</td><td className="mono">{r[4]}</td></tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─────────── BEDS ─────────── */
const Beds = () => {
  const [deptId, setDeptId] = React.useState(1);
  // Gen for selected dept (use static for #1, generate for others)
  const beds = deptId === 1 ? P1_BEDS : Array(20).fill(0).map((_, i) => {
    const id = String.fromCharCode(913 + (deptId - 1)) + "-" + String(i+1).padStart(2,"0");
    const types = ["πολύκλινο","πολύκλινο","μονόκλινο","ΜΕΘ"];
    const statuses = ["available","occupied","occupied","occupied","maintenance","available"];
    return { id, dept: deptId, type: types[i % 4], status: statuses[i % 6], patient: i % 6 < 4 ? "Ασθενής " + (i+1) : null };
  });
  const counts = beds.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});
  return (
    <div>
      <PageHeader
        title="Διαχείριση Κλινών"
        subtitle="Ζωντανή κατάσταση κλινών ανά τμήμα"
        actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Ανάθεση Κλίνης</button>}
      />
      <div className="hstack" style={{gap: 8, marginBottom: 16, flexWrap:"wrap"}}>
        {P1_DEPARTMENTS.map(d => (
          <button key={d.id} className={"btn " + (deptId === d.id ? "btn-primary" : "btn-ghost")} onClick={() => setDeptId(d.id)} id={"bed-dept-" + d.id}>
            {d.name}
          </button>
        ))}
      </div>
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <div className="stat"><div className="stat-label">Σύνολο</div><div className="stat-value">{beds.length}</div></div>
        <div className="stat"><div className="stat-label" style={{color:"var(--green-600)"}}>Διαθέσιμες</div><div className="stat-value" style={{color:"var(--green-600)"}}>{counts.available || 0}</div></div>
        <div className="stat"><div className="stat-label" style={{color:"var(--red-600)"}}>Κατειλημμένες</div><div className="stat-value" style={{color:"var(--red-600)"}}>{counts.occupied || 0}</div></div>
        <div className="stat"><div className="stat-label" style={{color:"var(--amber-600)"}}>Συντήρηση</div><div className="stat-value" style={{color:"var(--amber-600)"}}>{counts.maintenance || 0}</div></div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 10}}>
        {beds.map(b => (
          <div key={b.id} className={"bed-cell " + b.status} id={"bed-" + b.id}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 6}}>
              <strong className="mono" style={{fontSize: 13}}>{b.id}</strong>
              <span className={"chip " + (b.type === "ΜΕΘ" ? "chip-violet" : b.type === "μονόκλινο" ? "chip-brand" : "")}>{b.type}</span>
            </div>
            <div style={{fontSize: 12, color:"var(--ink-600)", minHeight: 16}}>
              {b.status === "available" && <span style={{color:"var(--green-600)"}}>● ελεύθερη</span>}
              {b.status === "occupied" && <span style={{color:"var(--red-600)"}}>● {b.patient}</span>}
              {b.status === "maintenance" && <span style={{color:"var(--amber-600)"}}>● συντήρηση</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard, Triage, Patients, PatientDetail, Beds });
