/* Pages: Dashboard, Triage, Patients, Beds — part 1 */

/* ─────────── DASHBOARD ─────────── */
const PatientPrescriptionsTab = ({ p }) => (
  <div className="card" style={{padding: 0, overflow: "hidden"}}>
    <table className="tbl">
      <thead>
        <tr>
          <th style={{width: 60}}>Εικόνα</th>
          <th>Φάρμακο</th>
          <th>Δοσολογία & Συχνότητα</th>
          <th>Διάρκεια</th>
          <th>Γιατρός</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {p.prescriptions && p.prescriptions.map((r, i) => {
          const isActive = new Date(r.end) > new Date();
          return (
            <tr key={i}>
              <td>
                <div style={{width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "var(--ink-100)", border: "1px solid var(--ink-200)"}}>
                  {r.drug_img ? (
                    <img src={r.drug_img} alt={r.drug_name} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                  ) : (
                    <div className="hstack" style={{justifyContent: "center", height: "100%", color: "var(--ink-400)"}}><Icon name="pill" size={18}/></div>
                  )}
                </div>
              </td>
              <td>
                <div style={{fontWeight: 700, fontSize: 14, color: "var(--brand-700)"}}>{r.drug_name}</div>
                <div className="muted" style={{fontSize: 10}}>{r.drug_ema}</div>
              </td>
              <td>
                <div style={{fontSize: 13}}>{r.dosage}</div>
                <div className="muted" style={{fontSize: 11}}>{r.frequency}</div>
              </td>
              <td className="mono" style={{fontSize: 12}}>
                {r.start} <br/> {r.end}
              </td>
              <td>
                <div style={{fontSize: 13, fontWeight: 500}}>Δρ. {r.doctor_name}</div>
              </td>
              <td>
                <span className={"chip " + (isActive ? "chip-green" : "chip-ink")}>
                  {isActive ? "Ενεργή" : "Έληξε"}
                </span>
              </td>
            </tr>
          );
        })}
        {(!p.prescriptions || p.prescriptions.length === 0) && (
          <tr>
            <td colSpan="6" style={{padding: 60, textAlign: "center"}} className="muted">
              <Icon name="pill" size={32} style={{opacity: 0.2, marginBottom: 12}}/><br/>
              Δεν βρέθηκε φαρμακευτική αγωγή για τον συγκεκριμένο ασθενή.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const Dashboard = ({ onPatientOpen }) => {
  const { DEPARTMENTS, PATIENTS_TRIAGE, BEDS, ADMISSIONS, SURGERIES } = window.UG;
  
  return (
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
        <div className="stat-value">{ADMISSIONS.filter(h => h.status === 'ενεργή').length}</div>
        <div className="stat-meta"><span className="muted">Live σύνολο</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Triage σε αναμονή</div>
        <div className="stat-value">{window.UG.PATIENTS_TRIAGE.filter(p => !p.outcome || p.outcome === 'Pending').length}</div>
        <div className="stat-meta"><span style={{color:"var(--red-500)"}}>● {window.UG.PATIENTS_TRIAGE.filter(p => (!p.outcome || p.outcome === 'Pending') && p.level === 1).length} κρίσιμα</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Διαθέσιμες κλίνες</div>
        <div className="stat-value">{BEDS.filter(b => b.status === 'διαθέσιμη').length} / {BEDS.length}</div>
        <div className="stat-meta"><span className="muted">{Math.round(100 * BEDS.filter(b => b.status === 'κατειλημμένη').length / BEDS.length)}% πληρότητα</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Προγρ. Χειρουργεία</div>
        <div className="stat-value">{SURGERIES.length}</div>
        <div className="stat-meta"><span className="muted">Σύνολο ημέρας</span></div>
      </div>
    </div>

    <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16}}>
      <div className="card" style={{padding: 18}}>
        <div className="hstack" style={{justifyContent:"space-between", marginBottom: 14}}>
          <div>
            <div style={{fontWeight: 600, fontSize: 14, color:"var(--ink-900)"}}>Πληρότητα ανά τμήμα</div>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Live δεδομένα · κλίνες σε χρήση / σύνολο</div>
          </div>
          <button className="btn btn-ghost" style={{padding:"4px 10px", fontSize:12, color:"var(--brand-600)"}}>● Live</button>
        </div>
        {DEPARTMENTS.map(d => {
          const used = BEDS.filter(b => b.dept == d.id && b.status === 'κατειλημμένη').length;
          const total = d.beds || 1;
          const pct = Math.round(100 * used / total);
          return (
            <div key={d.id} style={{display:"grid", gridTemplateColumns:"160px 1fr 80px", alignItems:"center", gap: 14, padding: "10px 0", borderBottom:"1px solid var(--ink-150)"}}>
              <div style={{fontSize: 13, fontWeight: 500}}>{window.DEPT_GREEK[d.name] || d.name}</div>
              <div className="sev-bar"><div className="fill" style={{width: pct + "%", background: pct > 85 ? "var(--red-500)" : pct > 70 ? "var(--amber-500)" : "var(--brand-500)"}}/></div>
              <div className="mono" style={{fontSize: 12, textAlign:"right", color:"var(--ink-600)"}}>{used}/{total} · {pct}%</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{padding: 18}}>
        <div style={{fontWeight: 600, fontSize: 14, color:"var(--ink-900)"}}>Ροή σήμερα</div>
        <div className="muted" style={{fontSize: 12, marginTop: 2, marginBottom: 14}}>Εισαγωγές, εξιτήρια, προσέλευσεις</div>
        {ADMISSIONS.slice(0, 7).map((h, i) => (
          <div key={i} 
               onClick={() => onPatientOpen(h.patient_AMKA)}
               style={{display:"flex", gap: 10, padding: "8px 0", fontSize: 12, borderBottom: i < 6 ? "1px solid var(--ink-150)" : "none", cursor:"pointer"}}>
            <span className="mono" style={{color:"var(--ink-500)", minWidth: 38}}>{h.from.split("-").slice(1).reverse().join("/")}</span>
            <span style={{color: h.status === 'ενεργή' ? "var(--brand-500)" : "var(--green-600)", fontSize: 10}}>●</span>
            <span style={{color:"var(--ink-700)"}}>{h.status === 'ενεργή' ? 'Εισαγωγή' : 'Εξιτήριο'} {h.patient_name} ({window.DEPT_GREEK[h.dept] || h.dept})</span>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

/* ─────────── TRIAGE ─────────── */
const TRIAGE_LEVELS = [
  { lvl: 1, label: "Άμεση", color: "var(--t1)", desc: "Απειλητικό για τη ζωή" },
  { lvl: 2, label: "Επείγον", color: "var(--t2)", desc: "Εντός 10 λεπτών" },
  { lvl: 3, label: "Λιγότερο Επείγον", color: "var(--t3)", desc: "Εντός 30 λεπτών" },
  { lvl: 4, label: "Μη Επείγον", color: "var(--t4)", desc: "Εντός 60 λεπτών" },
  { lvl: 5, label: "Καθόλου Επείγον", color: "var(--t5)", desc: "Εντός 120 λεπτών" },
];

const Triage = ({ onAdmit, onPatientOpen }) => {
  const [triages, setTriages] = React.useState(window.UG.PATIENTS_TRIAGE);
  const [view, setView] = React.useState("active");
  const [loading, setLoading] = React.useState(null);

  const handleUpdateLevel = async (id, level) => {
    setLoading(id);
    try {
      const resp = await fetch('/api/triage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, level })
      });
      if (resp.ok) {
        // Update local state immediately
        const next = triages.map(p => p.id === id ? { ...p, level } : p);
        setTriages(next);
        window.UG.PATIENTS_TRIAGE = next; // Sync with global for other components
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const active = triages.filter(p => !p.outcome || p.outcome === 'Pending');
  const history = triages.filter(p => p.outcome && p.outcome !== 'Pending');
  
  const stats = {
    pending: active.length,
    avgWait: Math.round(active.reduce((acc, curr) => acc + (curr.waitMin || 0), 0) / (active.length || 1)) || 0,
    admitted: triages.filter(p => p.outcome === 'hospitalized').length,
    discharged: triages.filter(p => p.outcome === 'discharged').length
  };

  const OUTCOME_LABELS = {
    'hospitalized': { label: 'Εισαγωγή', chip: 'chip-brand' },
    'discharged': { label: 'Εξιτήριο', chip: 'chip-green' },
    'Pending': { label: 'Σε αναμονή', chip: 'chip-amber' }
  };

  return (
    <div>
      <PageHeader
        title="Διαλογή & Επείγοντα (Triage)"
        subtitle="Διαχείριση ροής ασθενών και ιστορικό επισκέψεων ΤΕΠ"
        actions={
          <div className="hstack" style={{gap: 8}}>
            <button className={"btn " + (view === "active" ? "btn-primary" : "btn-ghost")} onClick={() => setView("active")}>Ενεργά Περιστατικά</button>
            <button className={"btn " + (view === "history" ? "btn-primary" : "btn-ghost")} onClick={() => setView("history")}>Ιστορικό Διαλογής</button>
            <button className="btn btn-primary" style={{marginLeft: 12}}><Icon name="plus" size={14}/>Νέα Διαλογή</button>
          </div>
        }
      />

      <div style={{display:"grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20}}>
        <div className="card hstack" style={{padding: 16, gap: 16}}>
          <div className="avatar" style={{background:"var(--brand-50)", color:"var(--brand-600)"}}><Icon name="users" size={20}/></div>
          <div><div className="muted" style={{fontSize: 12}}>Σε Αναμονή</div><div style={{fontSize: 20, fontWeight: 700}}>{stats.pending}</div></div>
        </div>
        <div className="card hstack" style={{padding: 16, gap: 16}}>
          <div className="avatar" style={{background:"var(--amber-50)", color:"var(--amber-600)"}}><Icon name="clock" size={20}/></div>
          <div><div className="muted" style={{fontSize: 12}}>Μέση Τρέχουσα Αναμονή</div><div style={{fontSize: 20, fontWeight: 700}}>{stats.avgWait}′</div></div>
        </div>
        <div className="card hstack" style={{padding: 16, gap: 16}}>
          <div className="avatar" style={{background:"var(--green-50)", color:"var(--green-600)"}}><Icon name="hospital" size={20}/></div>
          <div><div className="muted" style={{fontSize: 12}}>Εισαγωγές</div><div style={{fontSize: 20, fontWeight: 700}}>{stats.admitted}</div></div>
        </div>
        <div className="card hstack" style={{padding: 16, gap: 16}}>
          <div className="avatar" style={{background:"var(--ink-50)", color:"var(--ink-600)"}}><Icon name="userCheck" size={20}/></div>
          <div><div className="muted" style={{fontSize: 12}}>Εξιτήρια ΤΕΠ</div><div style={{fontSize: 20, fontWeight: 700}}>{stats.discharged}</div></div>
        </div>
      </div>

      {view === "active" ? (
        <div style={{display:"grid", gridTemplateColumns: "1fr 5fr", gap: 20}}>
          {/* Waiting for Initial Sorting */}
          <div className="card" style={{padding: 0, overflow:"hidden", borderTop: "4px solid var(--ink-400)", background: "var(--ink-50)"}}>
            <div style={{padding: 12, background: "var(--ink-150)", borderBottom: "1px solid var(--ink-200)"}}>
              <div style={{fontWeight: 700, fontSize: 16, color: "var(--ink-700)"}}>Προς Διαλογή</div>
              <div className="muted" style={{fontSize: 11, marginTop: 2}}>Νέες Αφίξεις</div>
            </div>
            <div style={{padding: 8, minHeight: 500}}>
              {active.filter(p => !p.level).map(p => (
                <div key={p.id} className="card" style={{padding: 10, marginBottom: 10, fontSize: 12, borderLeft: "4px solid var(--ink-300)"}}>
                  <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                    <strong onClick={() => onPatientOpen(p.amka)} style={{cursor:"pointer", color: "var(--brand-700)"}}>{p.name}</strong>
                    <span className="mono muted" style={{fontSize: 10}}>{p.arrival.split(" ")[1]}</span>
                  </div>
                  <div className="muted" style={{fontSize: 11, lineHeight: 1.3, marginBottom: 10}}>{p.symptoms}</div>
                  
                  <div style={{display:"flex", gap: 4, flexWrap: "wrap"}}>
                    {[1,2,3,4,5].map(lvl => (
                      <button 
                        key={lvl}
                        disabled={loading === p.id}
                        className="btn btn-ghost" 
                        style={{
                          flex: 1, 
                          padding: "6px 0", 
                          fontSize: 11, 
                          fontWeight: 700,
                          border: "1px solid var(--ink-250)", 
                          background: "white",
                          color: "var(--ink-700)"
                        }}
                        onClick={(e) => { e.stopPropagation(); handleUpdateLevel(p.id, lvl); }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {active.filter(p => !p.level).length === 0 && <div className="muted" style={{textAlign:"center", marginTop: 60, fontSize: 11, opacity: 0.6}}>Δεν υπάρχουν νέες αφίξεις</div>}
            </div>
          </div>

          {/* Categorized Queues */}
          <div style={{display:"grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12}}>
            {TRIAGE_LEVELS.map(l => {
              const lPatients = active.filter(p => Number(p.level) === l.lvl);
              return (
                <div key={l.lvl} className="card" style={{padding: 0, overflow:"hidden", borderTop: "4px solid " + l.color}}>
                  <div style={{padding: 12, background: "var(--ink-50)", borderBottom: "1px solid var(--ink-150)"}}>
                    <div style={{fontWeight: 700, fontSize: 18, color: l.color}}>Επ. {l.lvl}</div>
                    <div style={{fontWeight: 600, fontSize: 11, marginTop: 2, whiteSpace:"nowrap"}}>{l.label}</div>
                  </div>
                  <div style={{padding: 8, minHeight: 400}}>
                    {lPatients.map(p => (
                      <div key={p.id} className="card" onClick={() => onPatientOpen(p.amka)} style={{padding: 10, marginBottom: 8, fontSize: 12, cursor:"pointer", boxShadow:"var(--shadow-sm)"}}>
                        <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                          <strong>{p.name}</strong>
                          <span className="mono muted" style={{fontSize: 10}}>{p.arrival.split(" ")[1]}</span>
                        </div>
                        <div className="muted" style={{fontSize: 11, lineHeight: 1.3, marginBottom: 8}}>{p.symptoms}</div>
                        <div style={{display:"flex", flexDirection: "column", gap: 8}}>
                          <div className="hstack" style={{justifyContent:"space-between"}}>
                             <span className="mono" style={{fontSize: 10, color: (p.waitMin > 30) ? "var(--red-600)" : "var(--brand-600)", fontWeight: 600}}>
                              {p.waitMin || 0}′ αναμ.
                            </span>
                            <button className="btn btn-ghost" style={{padding: "2px 6px", fontSize: 10, border: "1px solid var(--ink-200)"}} onClick={(e) => {e.stopPropagation(); onAdmit();}}>Εισαγωγή</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {lPatients.length === 0 && <div className="muted" style={{textAlign:"center", marginTop: 40, fontSize: 11, opacity: 0.4}}>Καθαρό</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ασθενής</th>
                <th>Ημ/νία & Ώρα</th>
                <th>Επίπεδο</th>
                <th>Συμπτώματα</th>
                <th>Αναμονή</th>
                <th>Αποτέλεσμα</th>
              </tr>
            </thead>
            <tbody>
              {history.map(p => (
                <tr key={p.id} style={{cursor:"pointer"}} onClick={() => onPatientOpen(p.amka)}>
                  <td><strong>{p.name}</strong><div className="muted mono" style={{fontSize: 10}}>{p.amka}</div></td>
                  <td className="mono">{p.arrival}</td>
                  <td>
                    <div className="hstack" style={{gap: 6}}>
                      <div style={{width: 8, height: 8, borderRadius: 4, background: TRIAGE_LEVELS.find(l => l.lvl === p.level)?.color}} />
                      {TRIAGE_LEVELS.find(l => l.lvl === p.level)?.label}
                    </div>
                  </td>
                  <td style={{maxWidth: 200, fontSize: 12}} className="muted">{p.symptoms}</td>
                  <td className="mono">{p.waitMin}′</td>
                  <td>
                    <span className={"chip " + (OUTCOME_LABELS[p.outcome]?.chip || "chip-ink")}>
                      {OUTCOME_LABELS[p.outcome]?.label || p.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─────────── PATIENTS ─────────── */
const Patients = ({ onOpen }) => {
  const { PATIENTS } = window.UG;
  return (
    <div>
      <PageHeader
        title="Μητρώο Ασθενών"
        subtitle="Πλήρης κατάλογος και ιατρικοί φάκελοι"
        actions={<>
          <button className="btn btn-ghost"><Icon name="download" size={14}/>Εξαγωγή</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Εγγραφή</button>
        </>}
      />
      <div className="card">
        <table className="tbl">
          <thead><tr><th>ΑΜΚΑ</th><th>Ονοματεπώνυμο</th><th>Ηλικία</th><th>Φύλο</th><th>Ασφάλεια</th><th>Τελευταία Επίσκεψη</th><th>Status</th></tr></thead>
          <tbody>
            {PATIENTS.map(p => {
              const lastH = p.hospitalizations[0];
              return (
                <tr key={p.id} onClick={() => onOpen(p.id)} style={{cursor:"pointer"}} id={"patient-row-" + p.id}>
                  <td className="mono">{p.amka}</td>
                  <td><strong>{p.last} {p.first}</strong></td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td><span className="chip">{p.insurance}</span></td>
                  <td className="mono">{lastH ? lastH.from : "—"}</td>
                  <td><span className={"chip " + (lastH?.status === 'ενεργή' ? "chip-amber" : "chip-green")}>{lastH?.status || "ελεύθερος"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination">
          <span>Εμφάνιση 1–{PATIENTS.length} από {PATIENTS.length}</span>
          <div className="pages"><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div>
        </div>
      </div>
    </div>
  );
};

const PatientDetail = ({ patientId, onBack }) => {
  const p = window.UG.PATIENTS.find(x => String(x.id).trim() === String(patientId).trim());
  const [tab, setTab] = React.useState("history");
  if (!p) return (
    <div className="card" style={{padding: 40, textAlign: "center"}}>
      <Icon name="alert" size={40} style={{color: "var(--red-500)", marginBottom: 16}}/>
      <h2 style={{margin: 0}}>Ο ασθενής δεν βρέθηκε</h2>
      <p className="muted">Το AMKA {patientId} δεν αντιστοιχεί σε κάποιον εγγεγραμμένο ασθενή.</p>
      <button className="btn btn-primary" onClick={onBack} style={{marginTop: 20}}>Επιστροφή</button>
    </div>
  );

  return (
    <div>
      <div className="hstack" style={{gap: 12, marginBottom: 16}}>
        <button className="btn btn-ghost" onClick={onBack}><Icon name="chevronLeft" size={14}/>Πίσω</button>
        <div style={{height: 24, borderLeft: "1px solid var(--ink-200)"}}/>
        <div className="mono muted">{p.id}</div>
      </div>
      
      <div style={{display:"grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start"}}>
        <div className="card" style={{padding: 20, position:"sticky", top: 80}}>
          <div className="ph-img" style={{width: 80, height: 80, borderRadius: 999, margin: "0 auto 16px", fontSize: 10}}>
            <span>{p.first[0]}{p.last[0]}</span>
          </div>
          <h2 style={{textAlign:"center", margin: "0 0 4px", fontSize: 18, letterSpacing:"-0.02em"}}>{p.last} {p.first}</h2>
          <div className="muted" style={{textAlign:"center", fontSize: 13, marginBottom: 16}}>AMKA: {p.amka}</div>
          
          <div className="vstack" style={{gap: 10, fontSize: 13}}>
            <div className="hstack" style={{justifyContent:"space-between"}}><span className="muted">Ηλικία</span><strong>{p.age} ετών</strong></div>
            <div className="hstack" style={{justifyContent:"space-between"}}><span className="muted">Φύλο / Βάρος</span><strong>{p.gender} · {p.weight}kg</strong></div>
            <div className="hstack" style={{justifyContent:"space-between"}}><span className="muted">Ασφάλεια</span><span className="chip">{p.insurance}</span></div>
          </div>

          <div style={{marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--ink-150)"}}>
            <div style={{fontWeight: 600, fontSize: 12, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--ink-500)", marginBottom: 10}}>Αλλεργίες</div>
            <div style={{display:"flex", gap: 6, flexWrap:"wrap"}}>
              {p.allergies.map(a => <span key={a} className="allergy-pill"><Icon name="alert" size={10}/>{a}</span>)}
              {p.allergies.length === 0 && <span className="muted" style={{fontSize: 12}}>Καμία γνωστή αλλεργία</span>}
            </div>
          </div>
        </div>

        <div>
          <div className="tabs">
            <div className={"tab" + (tab === "history" ? " active" : "")} onClick={() => setTab("history")}>Ιστορικό Νοσηλειών</div>
            <div className={"tab" + (tab === "labs" ? " active" : "")} onClick={() => setTab("labs")}>Εργαστηριακά</div>
            <div className={"tab" + (tab === "acts" ? " active" : "")} onClick={() => setTab("acts")}>Πράξεις & Χειρουργεία</div>
            <div className={"tab" + (tab === "prescriptions" ? " active" : "")} onClick={() => setTab("prescriptions")}>Φαρμακευτική Αγωγή</div>
          </div>
          {tab === "history" && <PatientHistoryTab p={p}/>}
          {tab === "labs" && <PatientLabsTab p={p}/>}
          {tab === "acts" && <PatientActsTab p={p}/>}
          {tab === "prescriptions" && <PatientPrescriptionsTab p={p}/>}
        </div>
      </div>
    </div>
  );
};

const PatientHistoryTab = ({ p }) => {
  const { ICD10 } = window.UG;
  return (
    <div className="vstack" style={{gap: 16}}>
      {p.hospitalizations.map(h => {
        const icd = ICD10.find(i => i.code === h.icd10);
        return (
          <div key={h.id} className="card" style={{padding: 18}}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 14}}>
              <div>
                <div className="hstack" style={{gap: 10}}>
                  <span className="chip chip-brand mono">{h.id}</span>
                  <strong style={{fontSize: 15}}>{window.DEPT_GREEK[h.dept] || h.dept}</strong>
                </div>
                <div className="muted" style={{fontSize: 12, marginTop: 4}}>{h.from} — {h.to || "σήμερα"}</div>
              </div>
              <span className={"chip " + (h.status === 'ενεργή' ? "chip-amber" : "chip-green")}>{h.status}</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 20}}>
              <div>
                <div className="field-label">ICD-10 Διάγνωση</div>
                <div className="mono" style={{fontSize: 13, color: "var(--brand-700)"}}>{h.icd10}</div>
                {icd && <div style={{fontSize: 11, marginTop: 2, lineHeight: 1.2}}>{icd.name}</div>}
              </div>
              <div><div className="field-label">P1_KEN</div><div className="mono" style={{fontSize: 13}}>{h.ken}</div></div>
              <div><div className="field-label">Κόστος</div><div className="mono" style={{fontSize: 13}}>{h.cost ? h.cost.toLocaleString("el-GR") : 0} €</div></div>
            </div>
          </div>
        );
      })}
      {p.hospitalizations.length === 0 && <div className="card muted" style={{padding: 40, textAlign:"center"}}>Δεν βρέθηκαν προηγούμενες νοσηλείες.</div>}
    </div>
  );
};

const PatientLabsTab = ({ p }) => (
  <div className="card">
    <table className="tbl">
      <thead><tr><th>Κωδ.</th><th>Εξέταση</th><th>Ημερομηνία</th><th>Αποτέλεσμα</th><th>Μονάδα</th><th>Κόστος</th><th>Γιατρός</th></tr></thead>
      <tbody>
        {[
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
      <thead>
        <tr>
          <th style={{width: 140}}>Ημερομηνία & Ώρα</th>
          <th>Ιατρική Πράξη / Επέμβαση</th>
          <th style={{width: 100}}>Αίθουσα</th>
          <th>Γιατρός</th>
          <th style={{width: 80}}>Διάρκεια</th>
          <th>Κατηγορία</th>
        </tr>
      </thead>
      <tbody>
        {p.surgeries && p.surgeries.map((s, i) => (
          <tr key={i}>
            <td className="mono" style={{fontSize: 11}}>{s.start}</td>
            <td><strong style={{color: "var(--brand-700)"}}>{s.name}</strong></td>
            <td><div className="hstack" style={{gap: 6}}><Icon name="scalpel" size={12}/>{s.room}</div></td>
            <td>
              <div style={{fontWeight: 500}}>Δρ. {s.surgeon_name}</div>
              <div className="muted" style={{fontSize: 10}}>Κωδ: {s.surgeon}</div>
            </td>
            <td className="mono">{s.dur}h</td>
            <td><span className={"chip " + (s.category === 'Επείγον' ? "chip-red" : "chip-brand")}>{s.category}</span></td>
          </tr>
        ))}
        {(!p.surgeries || p.surgeries.length === 0) && (
          <tr><td colSpan="6" style={{padding: 60, textAlign: "center"}} className="muted">Δεν βρέθηκαν καταγεγραμμένες πράξεις ή χειρουργεία.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

/* ─────────── BEDS ─────────── */

const Beds = ({ onPatientOpen }) => {
  const [deptId, setDeptId] = React.useState(1);
  const { DEPARTMENTS, BEDS } = window.UG;
  const beds = BEDS.filter(b => b.dept == deptId);
  
  const occupied = beds.filter(b => b.status === 'κατειλημμένη');
  const available = beds.filter(b => b.status === 'διαθέσιμη');
  const maintenance = beds.filter(b => b.status === 'υπό συντήρηση');

  const freeByType = available.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Διαχείριση Κλινών"
        subtitle="Ζωντανή κατάσταση κλινών ανά τμήμα"
        actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Ανάθεση Κλίνης</button>}
      />
      <div className="hstack" style={{gap: 8, marginBottom: 24, flexWrap:"wrap"}}>
        {DEPARTMENTS.map(d => (
          <button key={d.id} className={"btn " + (deptId === d.id ? "btn-primary" : "btn-ghost")} onClick={() => setDeptId(d.id)} id={"bed-dept-" + d.id}>
            {window.DEPT_GREEK[d.name] || d.name}
          </button>
        ))}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 24}}>
        <div className="vstack" style={{gap: 20}}>
          {/* OCCUPIED SECTION */}
          <section>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 12}}>
              <h3 style={{fontSize: 14, fontWeight: 600, color:"var(--red-600)"}}>● Κατειλημμένες ({occupied.length})</h3>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10}}>
              {occupied.map(b => (
                <div key={b.id} 
                     onClick={() => onPatientOpen(b.patient_AMKA)}
                     className="card bed-card occupied" style={{padding: 12, cursor:"pointer"}}>
                  <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                    <strong className="mono">{b.id}</strong>
                    <span className="chip chip-brand" style={{fontSize: 10}}>{window.BED_TYPE_GREEK[b.type] || b.type}</span>
                  </div>
                  <div style={{fontSize: 13, fontWeight: 500}}>{b.patient}</div>
                </div>
              ))}
            </div>
          </section>

          {/* MAINTENANCE SECTION */}
          {maintenance.length > 0 && (
            <section>
              <h3 style={{fontSize: 14, fontWeight: 600, color:"var(--amber-600)", marginBottom: 12}}>● Συντήρηση ({maintenance.length})</h3>
              <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 10}}>
                {maintenance.map(b => (
                  <div key={b.id} className="card bed-card maintenance" style={{padding: 10, textAlign:"center"}}>
                    <div className="mono" style={{fontSize: 12, fontWeight: 600}}>{b.id}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="vstack" style={{gap: 20}}>
          {/* FREE SUMMARY SECTION */}
          <section className="card" style={{padding: 20}}>
            <h3 style={{fontSize: 14, fontWeight: 600, color:"var(--green-600)", marginBottom: 16}}>● Διαθέσιμες ({available.length})</h3>
            <div className="vstack" style={{gap: 12}}>
              {Object.entries(freeByType).map(([type, count]) => (
                <div key={type} className="hstack" style={{justifyContent:"space-between", paddingBottom: 8, borderBottom:"1px solid var(--ink-150)"}}>
                  <span style={{fontSize: 13}}>{window.BED_TYPE_GREEK[type] || type}</span>
                  <strong style={{fontSize: 14}}>{count}</strong>
                </div>
              ))}
              {available.length === 0 && <div className="muted" style={{fontSize: 13}}>Καμία διαθέσιμη κλίνη</div>}
            </div>
          </section>

          {/* QUICK ID LIST FOR FREE BEDS */}
          <section className="card" style={{padding: 16, background:"var(--ink-50)"}}>
            <div style={{fontSize: 11, fontWeight: 600, textTransform:"uppercase", color:"var(--ink-500)", marginBottom: 10}}>IDs Διαθέσιμων</div>
            <div style={{display:"flex", gap: 6, flexWrap:"wrap"}}>
              {available.map(b => (
                <span key={b.id} className="mono" style={{fontSize: 10, background:"#fff", padding: "2px 6px", borderRadius: 4, border:"1px solid var(--ink-200)"}}>{b.id}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard, Triage, Patients, PatientDetail, Beds });
