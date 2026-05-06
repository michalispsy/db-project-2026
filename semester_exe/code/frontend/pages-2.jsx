/* Pages part 2: Staff, Shifts, Hierarchy, Hospitalizations, Prescriptions, OR */

const P2_DEPTS = window.UG.DEPARTMENTS;
const P2_DOCS = window.UG.DOCTORS;
const P2_NRS = window.UG.NURSES;
const P2_ADM = window.UG.ADMIN;
const P2_BD = window.UG.BEDS;
const P2_ICD10 = window.UG.ICD10;
const P2_KEN = window.UG.KEN;
const P2_DRUGS = window.UG.DRUGS;
const P2_SURGERIES = window.UG.SURGERIES;
const P2_PTS = window.UG.PATIENTS;

/* ─────────── STAFF ─────────── */
const Staff = () => {
  const [tab, setTab] = React.useState("doctors");
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
        <div className={"tab" + (tab === "doctors" ? " active" : "")} onClick={() => setTab("doctors")} id="staff-tab-doctors">Γιατροί <span className="count">{P2_DOCS.length}</span></div>
        <div className={"tab" + (tab === "nurses" ? " active" : "")} onClick={() => setTab("nurses")} id="staff-tab-nurses">Νοσηλευτικό <span className="count">{P2_NRS.length}</span></div>
        <div className={"tab" + (tab === "admin" ? " active" : "")} onClick={() => setTab("admin")} id="staff-tab-admin">Διοικητικό <span className="count">{P2_ADM.length}</span></div>
      </div>
      {tab === "doctors" && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th></th><th>Ονοματεπώνυμο</th><th>Άδεια</th><th>Ειδικότητα</th><th>Βαθμίδα</th><th>Τμήμα</th><th>Προϊστάμενος</th></tr></thead>
            <tbody>
              {P2_DOCS.map(d => {
                const sup = P2_DOCS.find(x => x.id === d.supervisorId);
                const dept = P2_DEPTS.find(x => x.id === d.deptId);
                return (
                  <tr key={d.id} id={"doctor-row-" + d.id}>
                    <td style={{width: 40}}><div className="avatar" style={{background:"var(--brand-100)", color:"var(--brand-700)"}}>{d.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                    <td><strong>{d.name}</strong></td>
                    <td className="mono" style={{color:"var(--ink-600)"}}>{d.lic}</td>
                    <td>{d.spec}</td>
                    <td><span className={"chip " + (d.rank === "Διευθυντής" ? "chip-brand" : d.rank === "Επιμελητής Α΄" ? "chip-violet" : d.rank === "Ειδικευόμενος" ? "chip-amber" : "")}>{d.rank}</span></td>
                    <td>{dept?.name}</td>
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
              {P2_NRS.map(n => (
                <tr key={n.id}>
                  <td style={{width: 40}}><div className="avatar" style={{background:"var(--green-100)", color:"var(--green-600)"}}>{n.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                  <td><strong>{n.name}</strong></td>
                  <td><span className={"chip " + (n.rank === "Προϊστάμενος" ? "chip-violet" : "")}>{n.rank}</span></td>
                  <td>{P2_DEPTS.find(d => d.id === n.deptId)?.name}</td>
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
              {P2_ADM.map(a => (
                <tr key={a.id}>
                  <td style={{width: 40}}><div className="avatar" style={{background:"var(--ink-150)", color:"var(--ink-700)"}}>{a.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div></td>
                  <td><strong>{a.name}</strong></td>
                  <td><span className="chip">{a.role}</span></td>
                  <td className="mono" style={{color:"var(--ink-600)"}}>{a.office}</td>
                  <td>{a.deptId ? P2_DEPTS.find(d => d.id === a.deptId)?.name : <span className="muted">—</span>}</td>
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
const Hierarchy = () => {
  const buildTree = (parentId) => P2_DOCS.filter(d => d.supervisorId === parentId).map(d => ({
    ...d, children: buildTree(d.id)
  }));
  const directors = buildTree(null);

  const Node = ({ node, depth = 0 }) => (
    <div style={{marginLeft: depth ? 24 : 0, position:"relative"}}>
      {depth > 0 && <span style={{position:"absolute", left: -16, top: 0, bottom: "50%", width: 12, borderLeft:"1px solid var(--ink-300)", borderBottom:"1px solid var(--ink-300)", borderBottomLeftRadius: 6}}/>}
      <div className="org-node">
        <div className="avatar" style={{background:"var(--brand-100)", color:"var(--brand-700)", fontSize: 9}}>{node.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
        <div>
          <div style={{fontWeight: 500}}>{node.name}</div>
          <div className="role">{node.rank} · {node.spec}</div>
        </div>
      </div>
      {node.children.map(c => <Node key={c.id} node={c} depth={depth + 1}/>)}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Ιεραρχία Επίβλεψης"
        subtitle="Πλήρης δομή supervision · αντιστοιχεί στο Q13 (recursive CTE)"
        actions={<button className="btn btn-ghost"><Icon name="code" size={14}/>Δες Q13</button>}
      />
      <div className="card" style={{padding: 24, overflowX: "auto"}}>
        {directors.map(d => <Node key={d.id} node={d}/>)}
      </div>
    </div>
  );
};

/* ─────────── SHIFTS ─────────── */
const Shifts = () => {
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
        {P2_DEPTS.slice(0,5).map(d => (
          <button key={d.id} className={"btn " + (d.id === 1 ? "btn-primary" : "btn-ghost")}>{d.name}</button>
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
      <div style={{marginTop: 14, display:"flex", gap: 12, fontSize: 11, color:"var(--ink-500)"}}>
        <span>Όρια μήνα: Γιατροί 15 · Νοσηλευτές 20 · Διοικ. 25</span>
        <span>· Ελάχ. 8h ανάπαυση μεταξύ βαρδιών</span>
        <span>· Μέγ. 3 συνεχόμενες νύχτες</span>
      </div>
    </div>
  );
};

/* ─────────── HOSPITALIZATIONS ─────────── */
const Hospitalizations = () => (
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
          <select className="select"><option>Καρδιολογική</option>{P2_DEPTS.slice(1).map(d=><option key={d.id}>{d.name}</option>)}</select>
        </div>
        <div>
          <label className="field-label">Διαθέσιμη κλίνη</label>
          <select className="select">
            {P2_BD.filter(b => b.status === "available").map(b => <option key={b.id}>{b.id} — {b.type}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">ICD-10 (διάγνωση εισαγωγής)</label>
          <select className="select">{P2_ICD10.map(c => <option key={c.code}>{c.code} — {c.name}</option>)}</select>
        </div>
        <div>
          <label className="field-label">P2_KEN</label>
          <select className="select">{P2_KEN.map(k => <option key={k.code}>{k.code} — {k.name} · {k.base}€ · ΜΔΝ {k.mdn} ημ.</option>)}</select>
        </div>
        <div style={{display:"flex", alignItems:"flex-end"}}>
          <button className="btn btn-primary" style={{width: "100%"}}><Icon name="check" size={14}/>Καταχώρηση</button>
        </div>
      </div>
    </div>
    <div className="card">
      <table className="tbl">
        <thead><tr><th>ID</th><th>Ασθενής</th><th>Τμήμα</th><th>Κλίνη</th><th>ICD-10</th><th>P2_KEN</th><th>Από</th><th>Διάρκεια</th><th>Κόστος</th><th>Status</th></tr></thead>
        <tbody>
          {[
            ["H-22041","Δ. Ραπτόπουλος","Καρδιολογική","Κ-12","I21.4","F62B","2026-04-12",4,"4.250 €","ενεργή"],
            ["H-22039","Β. Νικολαΐδης","Καρδιολογική","Κ-07","I50.9","F62A","2026-04-10",6,"3.890 €","ενεργή"],
            ["H-22034","Α. Λαμπρίδης","Καρδιολογική","Κ-01","I21.4","F62B","2026-04-09",7,"5.120 €","ενεργή",true],
            ["H-22019","Π. Καρά","Παθολογική","Π-04","E11.9","E62A","2026-04-08",8,"2.610 €","ενεργή"],
            ["H-22011","Λ. Δερμιτζάκης","Παθολογική","Π-09","J18.9","E62A","2026-04-08",8,"2.310 €","ενεργή"],
            ["H-22008","Ε. Παπαϊωάννου","Καρδιολογική","Κ-03","I50.9","F62A","2026-04-07",9,"4.780 €","ενεργή",true],
            ["H-21998","Σ. Δημητρίου","Καρδιολογική","Κ-05","I21.4","F62B","2026-04-06",10,"6.020 €","ενεργή",true],
            ["H-21982","Μ. Σαββίδης","Μ.Ε.Θ.","Μ-02","I21.4","F62A","2026-04-05",11,"12.340 €","ενεργή"],
            ["H-21978","Ν. Βαρθαλίτης","Παθολογική","Π-12","J18.9","E62A","2026-04-04",6,"1.940 €","εξιτήριο"],
            ["H-21956","Ι. Σπύρου","Χειρουργική","Χ-04","K35.8","G07A","2026-04-02",5,"5.890 €","εξιτήριο"],
            ["H-21878","Δ. Ραπτόπουλος","Καρδιολογική","Κ-08","I50.9","F62A","2025-11-22",7,"3.120 €","εξιτήριο"],
            ["H-21855","Ε. Λάππα","Παιδιατρική","Π-Β-03","J18.9","E62A","2025-11-15",4,"1.620 €","εξιτήριο"],
          ].map(r => (
            <tr key={r[0]} style={{cursor:"pointer"}} id={"hosp-row-" + r[0]}>
              <td className="mono">{r[0]}</td>
              <td><strong>{r[1]}</strong></td>
              <td>{r[2]}</td>
              <td className="mono">{r[3]}</td>
              <td className="mono">{r[4]}</td>
              <td className="mono">{r[5]}</td>
              <td className="mono">{r[6]}</td>
              <td>
                <span className="mono">{r[7]} ημ.</span>
                {r[10] && <span className="chip chip-amber" style={{marginLeft:6}} title="Υπέρβαση ΜΔΝ">⚠ ΜΔΝ</span>}
              </td>
              <td className="mono" style={{textAlign:"right"}}>{r[8]}</td>
              <td><span className={"chip " + (r[9] === "ενεργή" ? "chip-amber" : "chip-green")}>{r[9]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>Εμφάνιση 1–12 από 312</span>
        <div className="pages"><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div>
      </div>
    </div>
  </div>
);

/* ─────────── PRESCRIPTIONS ─────────── */
const Prescriptions = () => {
  const [patientId, setPatientId] = React.useState("P-1042");
  const [drugId, setDrugId] = React.useState("DR07");
  const patient = P2_PTS.find(p => p.id === patientId) || P2_PTS[0];
  const drug = P2_DRUGS.find(d => d.id === drugId);
  const conflict = drug && patient.allergies.some(a => drug.substance.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(drug.substance.toLowerCase()));

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
              <select className="select"><option>Δρ. Ανδρέας Παπαδημητρίου · Καρδιολογία</option>{P2_DOCS.slice(1,8).map(d => <option key={d.id}>Δρ. {d.name}</option>)}</select>
            </div>
            <div>
              <label className="field-label">Ασθενής</label>
              <select className="select" value={patientId} onChange={e => setPatientId(e.target.value)} id="rx-patient">
                {P2_PTS.map(p => <option key={p.id} value={p.id}>{p.last} {p.first} ({p.amka})</option>)}
              </select>
              {patient.allergies.length > 0 && (
                <div style={{display:"flex", gap: 4, marginTop: 8, flexWrap:"wrap"}}>
                  <span className="muted" style={{fontSize: 11}}>Αλλεργίες:</span>
                  {patient.allergies.map(a => <span key={a} className="allergy-pill"><Icon name="alert" size={9}/>{a}</span>)}
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Φάρμακο (EMA Article 57)</label>
              <select className="select" value={drugId} onChange={e => setDrugId(e.target.value)} id="rx-drug">
                {P2_DRUGS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.substance}</option>)}
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
                  Το φάρμακο <strong>{drug.name}</strong> περιέχει <strong>{drug.substance}</strong>, στο οποίο ο/η ασθενής είναι αλλεργικός/ή. Επιλέξτε εναλλακτικό σκεύασμα.
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
                {[
                  ["Concor 5mg","2026-04-12","2026-05-12","Α. Παπαδημητρίου"],
                  ["Lipitor 20mg","2026-04-12","2026-07-12","Α. Παπαδημητρίου"],
                  ["Plavix 75mg","2026-04-12","2026-04-26","Γ. Αντωνίου"],
                  ["Salospir 81mg","2026-04-12","2026-10-12","Α. Παπαδημητρίου"],
                  ["Depon 500mg","2025-11-22","2025-11-29","Γ. Αντωνίου"],
                ].map(r => (
                  <tr key={r[0]+r[1]}>
                    <td><strong>{r[0]}</strong></td><td className="mono">{r[1]}</td><td className="mono">{r[2]}</td><td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card" style={{padding: 18}}>
            <div style={{fontWeight: 600, fontSize: 14, marginBottom: 10}}>Έλεγχοι μοναδικότητας</div>
            <div style={{fontSize: 12, color:"var(--ink-600)", lineHeight: 1.6}}>
              Ο συνδυασμός <span className="mono">(γιατρός, ασθενής, φάρμακο, ημ. έναρξης)</span> πρέπει να είναι μοναδικός.
              <div style={{marginTop: 8, display:"flex", gap: 6, alignItems:"center", color:"var(--green-600)"}}><Icon name="check" size={14}/>Καμία διπλοεγγραφή στα τελευταία 30 ημέρες.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── OR / GANTT ─────────── */
const OperatingRooms = () => {
  const rooms = ["ΧΑ-1","ΧΑ-2","ΧΑ-3","ΧΑ-4"];
  const startHour = 7;
  const endHour = 19;
  const totalH = endHour - startHour;
  return (
    <div>
      <PageHeader
        title="Χειρουργεία — Ημερολόγιο Αιθουσών"
        subtitle="Δευτέρα 5 Μαΐου 2026 · prevention double-booking για αίθουσες & χειρουργούς"
        actions={<>
          <button className="btn btn-ghost">‹ 4 Μαΐ</button>
          <button className="btn btn-ghost">6 Μαΐ ›</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέο Χειρουργείο</button>
        </>}
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
          const ops = P2_SURGERIES.filter(s => s.room === room);
          return (
            <div key={room} className="gantt-row">
              <div className="room-label"><Icon name="scalpel" size={12}/>{room}</div>
              <div className="track">
                {ops.map(op => {
                  const left = ((op.start - startHour) / totalH) * 100;
                  const width = (op.dur / totalH) * 100;
                  const surgeon = P2_DOCS.find(d => d.id === op.surgeon);
                  return (
                    <div key={op.id} id={"surgery-" + op.id} className={"gantt-block " + (op.urgent ? "cat-emergency" : op.category === "Β" ? "cat-b" : "")} style={{left: left + "%", width: width + "%"}}>
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

      <div className="card" style={{padding: 18, marginTop: 16}}>
        <div style={{fontWeight: 600, fontSize: 14, marginBottom: 10}}>Λεπτομέρειες χειρουργείου</div>
        <div style={{display:"grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14}}>
          <div>
            <label className="field-label">Πράξη</label>
            <input className="input" defaultValue="Στεφανιογραφία"/>
          </div>
          <div>
            <label className="field-label">Κατηγορία</label>
            <select className="select"><option>Α — χειρουργική</option><option>Β — διαγνωστική</option></select>
          </div>
          <div>
            <label className="field-label">Επικεφαλής χειρουργός</label>
            <select className="select">{P2_DOCS.filter(d=>d.surgeries>0).map(d=><option key={d.id}>{d.name}</option>)}</select>
          </div>
          <div>
            <label className="field-label">Διάρκεια</label>
            <input className="input" defaultValue="2h"/>
          </div>
          <div style={{gridColumn: "span 2"}}>
            <label className="field-label">Βοηθοί (γιατροί + νοσηλευτές)</label>
            <div className="hstack" style={{flexWrap:"wrap", gap: 6, padding: 6, border:"1px solid var(--ink-200)", borderRadius: "var(--r-sm)", minHeight: 38}}>
              <span className="chip chip-brand">Δρ. Δ. Παπαγιάννη ×</span>
              <span className="chip chip-brand">Δρ. Κ. Ροζάκης ×</span>
              <span className="chip chip-green">Νοσ. Α. Παπαδάκη ×</span>
              <input style={{border:"none", outline:"none", flex:1, minWidth: 120, fontSize: 13}} placeholder="+ προσθήκη..."/>
            </div>
          </div>
          <div>
            <label className="field-label">Αίθουσα</label>
            <select className="select">{rooms.map(r=><option key={r}>{r}</option>)}</select>
          </div>
          <div>
            <label className="field-label">Ώρα έναρξης</label>
            <input className="input" type="time" defaultValue="08:00"/>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Staff, Hierarchy, Shifts, Hospitalizations, Prescriptions, OperatingRooms });
