/* Pages part 2: Staff, Shifts, Hierarchy, Hospitalizations, Prescriptions, OR */

/* ─────────── STAFF ─────────── */
const Staff = () => {
  const [tab, setTab] = React.useState("doctors");
  const { DEPARTMENTS, DOCTORS, NURSES, ADMIN } = window.UG;
  
  return (
    <div>
      <PageHeader
        title="Προσωπικό"
        subtitle="Κατάλογος ιατρικού, νοσηλευτικού και διοικητικού προσωπικού"
        actions={<>
          <button className="btn btn-ghost"><Icon name="download" size={14}/>Εξαγωγή</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέο Μέλος</button>
        </>}
      />
      <div className="tabs">
        <div className={"tab" + (tab === "doctors" ? " active" : "")} onClick={() => setTab("doctors")} id="staff-tab-doctors">Γιατροί <span className="count">{DOCTORS.length}</span></div>
        <div className={"tab" + (tab === "nurses" ? " active" : "")} onClick={() => setTab("nurses")} id="staff-tab-nurses">Νοσηλευτικό <span className="count">{NURSES.length}</span></div>
        <div className={"tab" + (tab === "admin" ? " active" : "")} onClick={() => setTab("admin")} id="staff-tab-admin">Διοικητικό <span className="count">{ADMIN.length}</span></div>
      </div>
      {tab === "doctors" && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th></th><th>Ονοματεπώνυμο</th><th>Άδεια</th><th>Ειδικότητα</th><th>Βαθμίδα</th><th>Τμήμα</th><th>Προϊστάμενος</th></tr></thead>
            <tbody>
              {DOCTORS.map(d => {
                const sup = DOCTORS.find(x => x.id === d.supervisorId);
                const dept = DEPARTMENTS.find(x => x.id === d.deptId);
                return (
                  <tr key={d.id} id={"doctor-row-" + d.id}>
                    <td style={{width: 40}}><div className="avatar" style={{background:"var(--brand-100)", color:"var(--brand-700)"}}>{d.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                    <td><strong>{d.name}</strong></td>
                    <td className="mono" style={{color:"var(--ink-600)"}}>{d.lic}</td>
                    <td>{d.spec}</td>
                    <td><span className={"chip " + (d.rank === "Διευθυντής" ? "chip-brand" : d.rank === "Επιμελητής Α΄" ? "chip-violet" : d.rank === "Ειδικευόμενος" ? "chip-amber" : "")}>{d.rank}</span></td>
                    <td>{window.DEPT_GREEK[dept?.name] || dept?.name}</td>
                    <td>{sup ? sup.name : <span className="muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === "nurses" && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th></th><th>Ονοματεπώνυμο</th><th>Βαθμίδα</th><th>Τμήμα</th></tr></thead>
            <tbody>
              {NURSES.map(n => (
                <tr key={n.id}>
                  <td style={{width: 40}}><div className="avatar" style={{background:"var(--green-100)", color:"var(--green-600)"}}>{n.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                  <td><strong>{n.name}</strong></td>
                  <td><span className={"chip " + (n.rank === "Προϊστάμενος" ? "chip-violet" : "")}>{n.rank}</span></td>
                  <td>{window.DEPT_GREEK[DEPARTMENTS.find(d => d.id === n.deptId)?.name] || DEPARTMENTS.find(d => d.id === n.deptId)?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "admin" && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th></th><th>Ονοματεπώνυμο</th><th>Ρόλος</th><th>Γραφείο</th><th>Τμήμα</th></tr></thead>
            <tbody>
              {ADMIN.map(a => (
                <tr key={a.id}>
                  <td style={{width: 40}}><div className="avatar" style={{background:"var(--ink-150)", color:"var(--ink-700)"}}>{a.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                  <td><strong>{a.name}</strong></td>
                  <td><span className="chip">{a.role}</span></td>
                  <td className="mono" style={{color:"var(--ink-600)"}}>{a.office}</td>
                  <td>{a.deptId ? (window.DEPT_GREEK[DEPARTMENTS.find(d => d.id === a.deptId)?.name] || DEPARTMENTS.find(d => d.id === a.deptId)?.name) : <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─────────── HIERARCHY ─────────── */
const RANK_GREEK = {
  "Director": "Διευθυντής",
  "Senior Attending": "Επιμελητής Α΄",
  "Junior Attending": "Επιμελητής Β΄",
  "Resident": "Ειδικευόμενος"
};

const Hierarchy = () => {
  const { DOCTORS, DEPARTMENTS } = window.UG;
  const buildTree = (parentId) => DOCTORS.filter(d => d.supervisorId === parentId).map(d => ({
    ...d, children: buildTree(d.id)
  }));
  const directors = buildTree(null);

  const Node = ({ node, depth = 0 }) => {
    const dept = DEPARTMENTS.find(d => d.id === node.deptId);
    return (
      <div style={{marginLeft: depth ? 20 : 0, position:"relative", marginBottom: 4}}>
        {depth > 0 && <span style={{position:"absolute", left: -14, top: 0, bottom: "16px", width: 10, borderLeft:"1px solid var(--ink-300)", borderBottom:"1px solid var(--ink-300)", borderBottomLeftRadius: 4}}/>}
        <div className="org-node" style={{padding: "6px 10px", gap: 10, borderRadius: 6, background: depth === 0 ? "var(--brand-50)" : "transparent"}}>
          <div className="avatar" style={{width: 28, height: 28, background: depth === 0 ? "var(--brand-500)" : "var(--brand-100)", color: depth === 0 ? "#fff" : "var(--brand-700)", fontSize: 8, flexShrink: 0}}>{node.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
          <div style={{overflow: "hidden"}}>
            <div style={{fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{node.name}</div>
            <div className="muted" style={{fontSize: 10, marginTop: 1}}>
              <span style={{color: "var(--brand-600)", fontWeight: 500}}>{RANK_GREEK[node.rank] || node.rank}</span>
              <span style={{margin: "0 4px"}}>·</span>
              <span>{window.DEPT_GREEK[dept?.name] || dept?.name}</span>
            </div>
          </div>
        </div>
        <div style={{borderLeft: node.children.length > 0 ? "1px solid var(--ink-200)" : "none", marginLeft: 14, paddingTop: 4}}>
          {node.children.map(c => <Node key={c.id} node={c} depth={depth + 1}/>)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Ιεραρχία Επίβλεψης"
        subtitle="Οργανόγραμμα ιατρικού προσωπικού · Αντιστοιχεί στο ερώτημα Q13"
        actions={<button className="btn btn-ghost"><Icon name="code" size={14}/>Δες SQL Q13</button>}
      />
      <div className="card" style={{padding: "24px", background: "var(--ink-50)"}}>
        <div style={{columnCount: 4, columnGap: 20, columnFill: "balance"}}>
          {directors.map(d => (
            <div key={d.id} style={{breakInside: "avoid", marginBottom: 20, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--ink-200)"}}>
              <Node node={d}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────── SHIFTS ─────────── */
const Shifts = () => {
  const { DEPARTMENTS } = window.UG;
  const days = ["Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ","Κυρ"];
  const shifts = ["Πρωί","Απόγευμα","Νύχτα"];
  const deptId = 1;
  const violations = [
    { day: 2, shift: 2, msg: "Ειδικευόμενος χωρίς Επιμ. Α΄ ή Διευθυντή" },
    { day: 5, shift: 2, msg: "4η συνεχόμενη νυχτερινή — Δ. Παπαγιάννη" },
    { day: 4, shift: 0, msg: "Διαθέσιμοι μόνο 2 διοικητικοί (απαιτ. ≥2 σε ισόγειο)" },
  ];
  return (
    <div>
      <PageHeader
        title="Εφημερίες"
        subtitle="Καρδιολογική · Εβδομάδα 4–10 Μαΐου 2026 · ελάχιστο: 3 γιατροί + 6 νοσηλευτές + 2 διοικητικοί"
        actions={<>
          <button className="btn btn-ghost">‹ Προηγ.</button>
          <button className="btn btn-ghost">Επόμ. ›</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Εφημερία</button>
        </>}
      />
      <div className="hstack" style={{gap: 8, marginBottom: 14, flexWrap:"wrap"}}>
        <span className="muted" style={{fontSize: 12}}>Τμήμα:</span>
        {DEPARTMENTS.slice(0,5).map(d => (
          <button key={d.id} className={"btn " + (d.id === 1 ? "btn-primary" : "btn-ghost")}>{window.DEPT_GREEK[d.name] || d.name}</button>
        ))}
      </div>
      {violations.length > 0 && (
        <div className="alert warn" style={{marginBottom: 14}}>
          <Icon name="alert" size={16}/>
          <div>
            <strong>{violations.length} προειδοποιήσεις στον τρέχοντα προγραμματισμό</strong>
            {violations.map((v, i) => <div key={i} style={{fontSize: 12, marginTop: 2}}>· {days[v.day]}, {shifts[v.shift].toLowerCase()} — {v.msg}</div>)}
          </div>
        </div>
      )}
      <div className="sched-grid">
        <div className="sched-head" style={{textAlign:"left"}}>Βάρδια</div>
        {days.map((d, i) => <div key={d} className="sched-head">{d} · {4 + i} Μαΐ</div>)}
        {shifts.map((sh, si) => (
          <React.Fragment key={sh}>
            <div className="sched-row-label">
              <div>{sh}</div>
              <div className="muted mono" style={{fontSize: 10, marginTop: 4}}>
                {sh === "Πρωί" ? "07:00–15:00" : sh === "Απόγευμα" ? "15:00–23:00" : "23:00–07:00"}
              </div>
            </div>
            {days.map((d, di) => {
              const v = violations.find(x => x.day === di && x.shift === si);
              const docs = 3 + ((si + di) % 2);
              const nurses = 6 + ((di) % 3);
              const adm = 2;
              return (
                <div key={d + si} className="sched-slot" style={{background: v ? "var(--amber-50)" : ""}}>
                  <div style={{display:"flex", gap: 4, flexWrap:"wrap"}}>
                    <span className={"shift-pill " + (docs >= 3 ? "" : "danger")}>👨‍⚕️ {docs}/3</span>
                    <span className={"shift-pill " + (nurses >= 6 ? "" : "danger")}>{"💉 " + nurses}/6</span>
                    <span className={"shift-pill " + (adm >= 2 ? "" : "danger")}>{"📋 " + adm}/2</span>
                  </div>
                  {v && <div style={{fontSize: 10, color:"var(--amber-600)", marginTop: 4, lineHeight: 1.3}}>⚠ {v.msg.split(" ").slice(0,4).join(" ")}…</div>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ─────────── HOSPITALIZATIONS ─────────── */
const Hospitalizations = ({ onPatientOpen }) => {
  const { DEPARTMENTS, BEDS, ICD10, KEN, ADMISSIONS, PATIENTS } = window.UG;
  return (
  <div>
    <PageHeader
      title="Νοσηλείες"
      subtitle="Όλες οι ενεργές και πρόσφατες νοσηλείες"
      actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Εισαγωγή</button>}
    />
    <div className="card" style={{padding: 18, marginBottom: 16}}>
      <div style={{fontWeight:600, fontSize: 14, marginBottom: 12}}>Νέα εισαγωγή</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 12}}>
        <div>
          <label className="field-label">Ασθενής</label>
          <input className="input" placeholder="ΑΜΚΑ ή όνομα…" defaultValue="P-1099 Σ. Καραμίντα"/>
        </div>
        <div>
          <label className="field-label">Τμήμα</label>
          <select className="select"><option>Καρδιολογικό</option>{DEPARTMENTS.slice(1).map(d=><option key={d.id}>{window.DEPT_GREEK[d.name] || d.name}</option>)}</select>
        </div>
        <div>
          <label className="field-label">Διαθέσιμη κλίνη</label>
          <select className="select">
            {BEDS.filter(b => b.status === "available").map(b => <option key={b.id}>{b.id} — {window.BED_TYPE_GREEK[b.type] || b.type}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">ICD-10 (διάγνωση εισαγωγής)</label>
          <select className="select">{ICD10.map(c => <option key={c.code}>{c.code} — {c.name}</option>)}</select>
        </div>
        <div>
          <label className="field-label">KEN</label>
          <select className="select">{KEN.map(k => <option key={k.code}>{k.code} — {k.name} · {k.base}€ · ΜΔΝ {k.mdn} ημ.</option>)}</select>
        </div>
        <div style={{display:"flex", alignItems:"flex-end"}}>
          <button className="btn btn-primary" style={{width: "100%"}}><Icon name="check" size={14}/>Καταχώρηση</button>
        </div>
      </div>
    </div>
    <div className="card">
      <table className="tbl">
        <thead><tr><th>ID</th><th>Ασθενής</th><th>Τμήμα</th><th>Κλίνη</th><th>ICD-10</th><th>KEN</th><th>Από</th><th>Διάρκεια</th><th>Κόστος</th><th>Status</th></tr></thead>
        <tbody>
          {ADMISSIONS.slice(0, 50).map(r => (
            <tr key={r.id} onClick={() => onPatientOpen(r.patient_AMKA)} style={{cursor:"pointer"}} id={"hosp-row-" + r.id}>
              <td className="mono">{r.id}</td>
              <td><strong>{r.patient_name || PATIENTS.find(p => p.amka === r.patient_AMKA)?.last}</strong></td>
              <td>{window.DEPT_GREEK[r.dept] || r.dept}</td>
              <td className="mono">{r.bed}</td>
              <td className="mono">{r.icd10}</td>
              <td className="mono">{r.ken}</td>
              <td className="mono">{r.from}</td>
              <td>
                <span className="mono">{r.to ? "Ολοκληρώθηκε" : "Ενεργή"}</span>
              </td>
              <td className="mono" style={{textAlign:"right"}}>{r.cost ? r.cost.toLocaleString("el-GR") : 0} €</td>
              <td><span className={"chip " + (r.status === "ενεργή" ? "chip-amber" : "chip-green")}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>Εμφάνιση 1–{Math.min(50, ADMISSIONS.length)} από {ADMISSIONS.length}</span>
        <div className="pages"><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div>
      </div>
    </div>
  </div>
  );
};

/* ─────────── PRESCRIPTIONS ─────────── */
const Prescriptions = () => {
  const { PATIENTS, DRUGS, DOCTORS, PRESCRIPTIONS } = window.UG;
  const [patientId, setPatientId] = React.useState(PATIENTS[0]?.id);
  const [drugId, setDrugId] = React.useState(DRUGS[0]?.id);
  const patient = PATIENTS.find(p => p.id === patientId) || PATIENTS[0];
  const drug = DRUGS.find(d => d.id === drugId);
  const conflict = drug && patient.allergies.some(a => drug.name.toLowerCase().includes(a.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Συνταγογράφηση"
        subtitle="Έκδοση φαρμακευτικής αγωγής με αυτόματο έλεγχο σύγκρουσης αλλεργιών"
      />
      <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
        <div className="card" style={{padding: 22}}>
          <div style={{fontWeight: 600, fontSize: 15, marginBottom: 16}}>Νέα Συνταγή</div>
          <div style={{display:"grid", gap: 14}}>
            <div>
              <label className="field-label">Γιατρός</label>
              <select className="select"><option>Δρ. Ανδρέας Παπαδημητρίου · Καρδιολογία</option>{DOCTORS.slice(1,8).map(d => <option key={d.id}>Δρ. {d.name}</option>)}</select>
            </div>
            <div>
              <label className="field-label">Ασθενής</label>
              <select className="select" value={patientId} onChange={e => setPatientId(e.target.value)} id="rx-patient">
                {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.last} {p.first} ({p.amka})</option>)}
              </select>
              {patient.allergies.length > 0 && (
                <div style={{display:"flex", gap: 4, marginTop: 8, flexWrap:"wrap"}}>
                  <span className="muted" style={{fontSize: 11}}>Αλλεργίες:</span>
                  {patient.allergies.map(a => <span key={a} className="allergy-pill"><Icon name="alert" size={9}/>{a}</span>)}
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Φάρμακο</label>
              <select className="select" value={drugId} onChange={e => setDrugId(e.target.value)} id="rx-drug">
                {DRUGS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12}}>
              <div>
                <label className="field-label">Δοσολογία</label>
                <input className="input" defaultValue="1 δισκίο"/>
              </div>
              <div>
                <label className="field-label">Συχνότητα</label>
                <select className="select"><option>Κάθε 8h</option><option>Κάθε 12h</option><option>Άπαξ ημερησίως</option></select>
              </div>
              <div>
                <label className="field-label">Έναρξη</label>
                <input className="input" type="date" defaultValue="2026-05-05"/>
              </div>
              <div>
                <label className="field-label">Λήξη</label>
                <input className="input" type="date" defaultValue="2026-05-12"/>
              </div>
            </div>

            {conflict ? (
              <div className="alert danger" id="rx-conflict-alert">
                <Icon name="alert" size={18}/>
                <div>
                  <strong>Σύγκρουση αλλεργίας — η συνταγή είναι αποκλεισμένη</strong>
                  Το φάρμακο <strong>{drug.name}</strong> ενδέχεται να περιέχει ουσίες στις οποίες ο/η ασθενής είναι αλλεργικός/ή.
                </div>
              </div>
            ) : (
              <div className="alert info" id="rx-ok-alert">
                <Icon name="check" size={18}/>
                <div><strong>Δεν εντοπίστηκε σύγκρουση.</strong>Καμία γνωστή αλλεργία δεν επικαλύπτει τη δραστική ουσία.</div>
              </div>
            )}

            <div style={{display:"flex", gap: 8, justifyContent:"flex-end"}}>
              <button className="btn btn-ghost">Ακύρωση</button>
              <button className={"btn " + (conflict ? "btn-danger" : "btn-primary")} disabled={conflict} id="rx-submit">
                <Icon name={conflict ? "x" : "check"} size={14}/>
                {conflict ? "Αποκλεισμένη" : "Έκδοση συνταγής"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{padding: 18, marginBottom: 14}}>
            <div style={{fontWeight: 600, fontSize: 14, marginBottom: 10}}>Ιστορικό συνταγών — {patient.last}</div>
            <table className="tbl" style={{fontSize: 12}}>
              <thead><tr><th>Φάρμακο</th><th>Από</th><th>Έως</th><th>Γιατρός</th></tr></thead>
              <tbody>
                {PRESCRIPTIONS.filter(r => r.patient_AMKA === patient.amka).map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.drug_name}</strong></td><td className="mono">{r.start}</td><td className="mono">{r.end}</td><td>{r.doctor_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── OR / GANTT ─────────── */
const OperatingRooms = ({ onPatientOpen }) => {
  const { SURGERIES, DOCTORS, PATIENTS } = window.UG;
  const rooms = ["ΧΑ-1","ΧΑ-2","ΧΑ-3","ΧΑ-4"];
  const startHour = 7;
  const endHour = 19;
  const totalH = endHour - startHour;
  return (
    <div>
      <PageHeader
        title="Χειρουργεία — Ημερολόγιο Αιθουσών"
        subtitle="Δευτέρα 5 Μαΐου 2026 · prevention double-booking για αίθουσες & χειρουργούς"
        actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Νέο Χειρουργείο</button>}
      />
      <div className="hstack" style={{gap: 12, marginBottom: 14}}>
        <span className="chip chip-brand"><span className="dot"/>Κατηγορία Α</span>
        <span className="chip chip-violet"><span className="dot"/>Κατηγορία Β</span>
        <span className="chip chip-red"><span className="dot"/>Έκτακτο</span>
      </div>
      <div className="gantt">
        <div className="gantt-header">
          <div style={{padding:12, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform:"uppercase", color:"var(--ink-500)"}}>Αίθουσα</div>
          <div className="hours">
            {Array(totalH).fill(0).map((_, i) => <div key={i}>{String(startHour + i).padStart(2,"0")}:00</div>)}
          </div>
        </div>
        {rooms.map(room => {
          const ops = SURGERIES.filter(s => s.room === room);
          return (
            <div key={room} className="gantt-row">
              <div className="room-label"><Icon name="scalpel" size={12}/>{room}</div>
              <div className="track">
                {ops.map(op => {
                  const left = ((op.start - startHour) / totalH) * 100;
                  const width = (op.dur / totalH) * 100;
                  const surgeon = DOCTORS.find(d => d.id === op.surgeon);
                  return (
                    <div key={op.id} id={"surgery-" + op.id} 
                         onClick={() => {
                           const patient = PATIENTS.find(p => (p.first + " " + p.last).includes(op.patient) || op.patient.includes(p.last));
                           if (patient) onPatientOpen(patient.amka);
                         }}
                         className={"gantt-block " + (op.urgent ? "cat-emergency" : op.category === "Β" ? "cat-b" : "")} 
                         style={{left: left + "%", width: width + "%", cursor:"pointer"}}>
                      <div className="block-title">{op.name}</div>
                      <div className="block-meta">{surgeon?.name.split(" ")[1]} · {op.patient} · {op.dur}h</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { Staff, Hierarchy, Shifts, Hospitalizations, Prescriptions, OperatingRooms });
