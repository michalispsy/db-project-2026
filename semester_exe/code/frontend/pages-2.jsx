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
                    <td><span className={"chip " + (d.rank === "Διευθυντής" ? "chip-brand" : d.rank === "Επιμελητής Α" ? "chip-violet" : d.rank === "Ειδικευόμενος" ? "chip-amber" : "")}>{d.rank}</span></td>
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
  "Senior Attending": "Επιμελητής Α",
  "Junior Attending": "Επιμελητής Β",
  "Resident": "Ειδικευόμενος"
};

const Hierarchy = () => {
  const { DEPARTMENTS, DOCTORS: rawDoctors } = window.UG;
  
  // De-duplicate doctors by AMKA to be 100% sure
  const DOCTORS = Array.from(new Map(rawDoctors.map(d => [d.id, d])).values());

  const buildTree = (parentId) => DOCTORS.filter(d => String(d.supervisorId) === String(parentId)).map(d => ({
    ...d, children: buildTree(d.id)
  }));
  const directors = buildTree(null);

  const Node = ({ node, depth = 0 }) => {
    // Ultra-robust ID matching checking all common field names
    const depts = (node.deptIds || []).map(id => {
      return DEPARTMENTS.find(d => 
        String(d.id || d.dept_id || d.deptId) === String(id)
      );
    }).filter(Boolean);
    
    const deptNames = depts.map(d => window.DEPT_GREEK[d.name] || d.name).join(", ") || "—";
    
    return (
      <div style={{marginLeft: depth ? 14 : 0, position:"relative", marginBottom: 2}}>
        {depth > 0 && (
          <div style={{
            position:"absolute", left: -10, top: 0, bottom: 12, width: 8, 
            borderLeft:"1.5px solid var(--ink-200)", borderBottom:"1.5px solid var(--ink-200)", 
            borderBottomLeftRadius: 4
          }}/>
        )}
        <div className="org-node" style={{
          padding: "6px 10px", gap: 10, borderRadius: 6, 
          background: depth === 0 ? "var(--brand-50)" : "#fff",
          border: depth === 0 ? "1px solid var(--brand-100)" : "1px solid var(--ink-150)",
          marginBottom: 4,
          boxShadow: depth === 0 ? "none" : "var(--shadow-sm)",
          display: "flex", alignItems: "center"
        }}>
          <div className="avatar" style={{
            width: 22, height: 22, 
            background: depth === 0 ? "var(--brand-500)" : "var(--brand-100)", 
            color: depth === 0 ? "#fff" : "var(--brand-700)", 
            fontSize: 8, flexShrink: 0,
            overflow: "hidden"
          }}>
            {node.img ? (
              <img src={node.img} alt="" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
            ) : (
              node.name.split(" ").map(s=>s[0]).slice(0,2).join("")
            )}
          </div>
          <div style={{overflow: "hidden", flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 11, color: "var(--ink-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{node.name}</div>
            <div className="muted" style={{fontSize: 9, marginTop: 1, display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 4, whiteSpace: "nowrap"}}>
              <span style={{color: "var(--brand-600)", fontWeight: 600, flexShrink: 0}}>{RANK_GREEK[node.rank] || node.rank}</span>
              <span style={{color: "var(--ink-300)", flexShrink: 0}}>·</span>
              <span style={{overflow: "hidden", textOverflow: "ellipsis", flex: 1}} title={deptNames}>{deptNames}</span>
            </div>
          </div>
        </div>
        <div style={{marginLeft: 10}}>
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
      <div style={{padding: "10px 0"}}>
        <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: 16,
          alignItems: "start"
        }}>
          {directors.map(d => (
            <div key={d.id} style={{background: "var(--ink-50)", borderRadius: 12, padding: 12, border: "1px solid var(--ink-200)"}}>
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
  const { DEPARTMENTS = [], SHIFTS = [] } = window.UG || {};
  const [selectedDept, setSelectedDept] = React.useState(DEPARTMENTS[0]?.id || 1);
  const [viewDate, setViewDate] = React.useState(new Date("2026-05-09")); // Default to today/active period
  const [selectedDay, setSelectedDay] = React.useState(null);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Align Monday as 0

  const GREEK_MONTHS = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
  const SLOT_GREEK = { "πρωινή": "Πρωί", "απογευματινή": "Απόγευμα", "νυχτερινή": "Νύχτα" };

  const getShiftsForDate = (dateStr) => {
    return SHIFTS.filter(s => s.date === dateStr && s.dept_id === selectedDept);
  };

  return (
    <div>
      <PageHeader
        title="Πρόγραμμα Εφημεριών"
        subtitle={`Πρόγραμμα προσωπικού για το τμήμα ${window.DEPT_GREEK[DEPARTMENTS.find(d => d.id === selectedDept)?.name] || ""}`}
        actions={
          <div className="hstack" style={{gap: 8}}>
            <button className="btn btn-ghost" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹ Προηγ.</button>
            <div style={{fontWeight: 700, width: 140, textAlign: "center"}}>{GREEK_MONTHS[month]} {year}</div>
            <button className="btn btn-ghost" onClick={() => setViewDate(new Date(year, month + 1, 1))}>Επόμ. ›</button>
            <button className="btn btn-primary" style={{marginLeft: 12}}><Icon name="plus" size={14}/>Νέα Βάρδια</button>
          </div>
        }
      />

      <div className="hstack" style={{gap: 8, marginBottom: 20, flexWrap:"wrap"}}>
        {DEPARTMENTS.map(d => (
          <button 
            key={d.id} 
            className={"btn " + (selectedDept === d.id ? "btn-primary" : "btn-ghost")}
            onClick={() => setSelectedDept(d.id)}
          >
            {window.DEPT_GREEK[d.name] || d.name}
          </button>
        ))}
      </div>

      <div className="calendar-container">
        <div className="calendar-header-grid">
          {["ΔΕ", "ΤΡ", "ΤΕ", "ΠΕ", "ΠΑ", "ΣΑ", "ΚΥ"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="calendar-grid">
          {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} className="calendar-day empty"></div>)}
          {[...Array(numDays)].map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayShifts = getShiftsForDate(dateStr);
            const isToday = dateStr === "2026-05-09";

            return (
              <div 
                key={dayNum} 
                className={"calendar-day" + (isToday ? " today" : "") + (dayShifts.length ? " interactive" : "")}
                onClick={() => dayShifts.length > 0 && setSelectedDay({ dateStr, dayNum, dayShifts })}
              >
                <div className="day-num">{dayNum}</div>
                <div className="day-content">
                  {dayShifts.map(s => (
                    <div key={s.shift_id} className="shift-entry">
                      <div className="shift-title">
                        <span className="dot" style={{background: s.shift_slot === 'νυχτερινή' ? 'var(--indigo-500)' : s.shift_slot === 'απογευματινή' ? 'var(--amber-500)' : 'var(--brand-500)'}}/>
                        {SLOT_GREEK[s.shift_slot] || s.shift_slot}
                      </div>
                      <div className="shift-staff">
                        {s.staff.slice(0, 3).map(st => (
                          <div key={st.id} className="staff-micro" title={`${st.role}: ${st.name}`}>
                            {st.name.split(" ").map(n => n[0]).join("")}
                          </div>
                        ))}
                        {s.staff.length > 3 && <div className="staff-more">+{s.staff.length - 3}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="shift-modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="shift-modal" onClick={e => e.stopPropagation()}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 16}}>
              <div style={{fontWeight: 700, fontSize: 18}}>
                Βάρδιες: {selectedDay.dayNum} {GREEK_MONTHS[month]} {year}
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedDay(null)}><Icon name="x" size={16}/></button>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap: 12}}>
              {["πρωινή", "απογευματινή", "νυχτερινή"].map(slot => {
                const shift = selectedDay.dayShifts.find(s => s.shift_slot === slot);
                if (!shift) return null;
                return (
                  <div key={slot} className="card" style={{borderLeft: `4px solid ${slot === 'νυχτερινή' ? 'var(--indigo-500)' : slot === 'απογευματινή' ? 'var(--amber-500)' : 'var(--brand-500)'}`}}>
                    <div style={{fontWeight: 600, marginBottom: 8}}>{SLOT_GREEK[slot]}</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8}}>
                      {shift.staff.map(st => (
                        <div key={st.id} className="hstack" style={{gap: 8}}>
                          <div className="avatar" style={{width: 24, height: 24, fontSize: 10, background:"var(--ink-100)", color:"var(--ink-700)"}}>
                            {st.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div style={{fontSize: 12, fontWeight: 600}}>{st.name}</div>
                            <div className="muted" style={{fontSize: 10}}>{st.role === 'doctor' ? '👨‍⚕️ Γιατρός' : st.role === 'nurse' ? '💉 Νοσηλευτής' : '📋 Διοικητικός'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .calendar-container { background: white; border-radius: 12px; border: 1px solid var(--ink-200); overflow: hidden; }
        .calendar-header-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--ink-50); border-bottom: 1px solid var(--ink-200); }
        .calendar-header-grid div { padding: 12px; text-align: center; font-size: 11px; font-weight: 700; color: var(--ink-500); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
        .calendar-day { min-height: 120px; border-right: 1px solid var(--ink-150); border-bottom: 1px solid var(--ink-150); padding: 8px; transition: background 0.2s; }
        .calendar-day:nth-child(7n) { border-right: none; }
        .calendar-day.empty { background: var(--ink-50); opacity: 0.5; }
        .calendar-day.today { background: var(--brand-50); }
        .calendar-day.interactive:hover { background: var(--ink-50); cursor: pointer; }
        .calendar-day.today .day-num { background: var(--brand-500); color: white; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 11px; }
        .day-num { font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--ink-600); }
        .day-content { display: flex; flex-direction: column; gap: 4px; }
        .shift-entry { background: var(--ink-50); border-radius: 6px; padding: 4px 6px; border-left: 3px solid var(--brand-500); }
        .shift-title { font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
        .shift-title .dot { width: 6px; height: 6px; border-radius: 3px; }
        .shift-staff { display: flex; gap: 2px; }
        .staff-micro { width: 18px; height: 18px; border-radius: 9px; background: white; border: 1px solid var(--ink-200); font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--ink-700); }
        .staff-more { font-size: 8px; color: var(--ink-500); align-self: center; margin-left: 2px; }
        
        .shift-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.15s ease-out; }
        .shift-modal { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 500px; box-shadow: var(--shadow-lg); max-height: 85vh; overflow-y: auto; animation: slideUp 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}}/>
    </div>
  );
};

/* ─────────── HOSPITALIZATIONS ─────────── */
const Hospitalizations = ({ onPatientOpen }) => {
  const { DEPARTMENTS, BEDS, ICD10, KEN, ADMISSIONS, PATIENTS } = window.UG;
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 50;
  
  const totalPages = Math.ceil(ADMISSIONS.length / itemsPerPage);
  const currentAdmissions = ADMISSIONS.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
            {BEDS.filter(b => b.status === "διαθέσιμη").map(b => <option key={b.id}>{b.id} — {window.BED_TYPE_GREEK[b.type] || b.type}</option>)}
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
        <thead><tr><th>ID</th><th>Ασθενής</th><th>Τμήμα</th><th>Κλίνη</th><th>Διάγνωση (ICD-10)</th><th>Από</th><th>Έως</th><th>Κόστος</th><th>Status</th></tr></thead>
        <tbody>
          {currentAdmissions.map(r => (
            <tr key={r.id} onClick={() => onPatientOpen(r.patient_AMKA)} style={{cursor:"pointer"}} id={"hosp-row-" + r.id}>
              <td className="mono">{r.id}</td>
              <td><strong>{r.patient_name || PATIENTS.find(p => p.amka === r.patient_AMKA)?.last}</strong></td>
              <td>{window.DEPT_GREEK[r.dept] || r.dept}</td>
              <td className="mono">{r.bed}</td>
              <td className="mono" title={`Εισαγωγή: ${r.icd10}`}>
                {r.icd10} {r.discharge_diagnosis_code ? `→ ${r.discharge_diagnosis_code}` : ''}
              </td>
              <td className="mono">{r.from}</td>
              <td className="mono" style={{color: r.to ? "inherit" : "var(--ink-400)"}}>{r.to || "—"}</td>
              <td className="mono" style={{textAlign:"right"}}>{r.cost ? r.cost.toLocaleString("el-GR") : 0} €</td>
              <td><span className={"chip " + (r.status === "ενεργή" ? "chip-amber" : "chip-green")}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>Εμφάνιση {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, ADMISSIONS.length)} από {ADMISSIONS.length}</span>
        <div className="pages">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
          <button className="active">{page}</button>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      </div>
    </div>
  </div>
  );
};

/* ─────────── PRESCRIPTIONS ─────────── */
const Prescriptions = ({ onPatientOpen, onNav }) => {
  const { PRESCRIPTIONS, DOCTORS, PATIENTS } = window.UG;
  const [filterDoc, setFilterDoc] = React.useState("");
  const [filterPat, setFilterPat] = React.useState("");
  const [filterDrug, setFilterDrug] = React.useState("");

  const filtered = PRESCRIPTIONS.filter(r => {
    const dMatch = r.doctor_name.toLowerCase().includes(filterDoc.toLowerCase());
    const pMatch = r.patient_name.toLowerCase().includes(filterPat.toLowerCase());
    const drMatch = r.drug_name.toLowerCase().includes(filterDrug.toLowerCase());
    return dMatch && pMatch && drMatch;
  });

  return (
    <div>
      <PageHeader 
        title="Κεντρικό Αρχείο Συνταγογραφήσεων" 
        subtitle={`Σύνολο: ${PRESCRIPTIONS.length} καταχωρήσεις · Φιλτραρισμένες: ${filtered.length}`}
        actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Νέα Συνταγή</button>}
      />

      <div className="card hstack" style={{padding: "16px 20px", gap: 20, marginBottom: 20, background: "var(--ink-50)"}}>
        <div style={{flex: 1}}>
          <div className="field-label" style={{marginBottom: 6}}>Φίλτρο Γιατρού</div>
          <div style={{position:"relative"}}>
            <Icon name="search" size={14} style={{position:"absolute", left: 10, top: 10, color: "var(--ink-400)"}}/>
            <input 
              className="input" 
              placeholder="Αναζήτηση γιατρού..." 
              value={filterDoc} 
              onChange={e => setFilterDoc(e.target.value)}
              style={{paddingLeft: 32}}
            />
          </div>
        </div>
        <div style={{flex: 1}}>
          <div className="field-label" style={{marginBottom: 6}}>Φίλτρο Ασθενή</div>
          <div style={{position:"relative"}}>
            <Icon name="search" size={14} style={{position:"absolute", left: 10, top: 10, color: "var(--ink-400)"}}/>
            <input 
              className="input" 
              placeholder="Αναζήτηση ασθενή..." 
              value={filterPat} 
              onChange={e => setFilterPat(e.target.value)}
              style={{paddingLeft: 32}}
            />
          </div>
        </div>
        <div style={{flex: 1}}>
          <div className="field-label" style={{marginBottom: 6}}>Φίλτρο Φαρμάκου</div>
          <div style={{position:"relative"}}>
            <Icon name="search" size={14} style={{position:"absolute", left: 10, top: 10, color: "var(--ink-400)"}}/>
            <input 
              className="input" 
              placeholder="Αναζήτηση φαρμάκου..." 
              value={filterDrug} 
              onChange={e => setFilterDrug(e.target.value)}
              style={{paddingLeft: 32}}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{padding: 0, overflow: "hidden"}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Φάρμακο</th>
              <th>Δοσολογία & Συχνότητα</th>
              <th>Ασθενής</th>
              <th>Γιατρός</th>
              <th>Διάρκεια</th>
              <th>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const isActive = new Date(r.end) > new Date();
              return (
                <tr key={r.id}>
                  <td style={{cursor: "pointer"}} onClick={() => onNav("drugs")}>
                    <div style={{fontWeight: 700, color: "var(--brand-700)"}}>{r.drug_name}</div>
                    <div className="muted" style={{fontSize: 10, marginTop: 2}}>{r.drug_ema}</div>
                  </td>
                  <td>
                    <div>{r.dosage}</div>
                    <div className="muted" style={{fontSize: 11}}>{r.frequency}</div>
                  </td>
                  <td style={{cursor: "pointer"}} onClick={() => onPatientOpen(r.patient_AMKA)} className="hover-link">
                    <div style={{fontWeight: 500, color: "var(--brand-600)"}}>{r.patient_name}</div>
                    <div className="mono muted" style={{fontSize: 10}}>{r.patient_AMKA}</div>
                  </td>
                  <td style={{cursor: "pointer"}} onClick={() => onNav("doctors")} className="hover-link">
                    <div style={{fontWeight: 500}}>Δρ. {r.doctor_name}</div>
                    <div className="muted" style={{fontSize: 11}}>{r.doctor_lic}</div>
                  </td>
                  <td className="mono" style={{fontSize: 12}}>
                    {r.start} <br/> {r.end}
                  </td>
                  <td>
                    <span className={"chip " + (isActive ? "chip-green" : "chip-ink")}>
                      {isActive ? "Ενεργή" : "Έληξε"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{padding: 60, textAlign: "center", color: "var(--ink-400)"}}>
            Δεν βρέθηκαν συνταγές με τα συγκεκριμένα φίλτρα.
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── OR / GANTT ─────────── */
/* ─────────── OR / SCHEDULE ─────────── */
const OperatingRooms = ({ onPatientOpen }) => {
  const { SURGERIES, DOCTORS } = window.UG;
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]); 
  
  // Get unique rooms from the data
  const rooms = Array.from(new Map(SURGERIES.map(s => [s.room, s.room])).values());
  
  const dailyOps = SURGERIES.filter(s => s.start.startsWith(selectedDate));
  
  const startHour = 7;
  const endHour = 22;
  const totalH = endHour - startHour;

  return (
    <div>
      <PageHeader
        title="Χειρουργεία — Πρόγραμμα Ημέρας"
        subtitle="Διαχείριση χειρουργικών αιθουσών και αποφυγή αλληλοεπικαλύψεων"
        actions={
          <div className="hstack" style={{gap: 12}}>
            <input 
              type="date" 
              className="input" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              style={{width: 160}}
            />
            <button className="btn btn-primary"><Icon name="plus" size={14}/>Νέο Χειρουργείο</button>
          </div>
        }
      />

      <div className="hstack" style={{gap: 12, marginBottom: 20}}>
        <div className="hstack" style={{gap: 6}}><div style={{width:10, height:10, borderRadius:2, background:"var(--brand-500)"}}/> Τακτικό</div>
        <div className="hstack" style={{gap: 6}}><div style={{width:10, height:10, borderRadius:2, background:"var(--violet-500)"}}/> Κατηγορία Β</div>
        <div className="hstack" style={{gap: 6}}><div style={{width:10, height:10, borderRadius:2, background:"var(--red-500)"}}/> Επείγον</div>
      </div>

      <div className="gantt">
        <div className="gantt-header">
          <div style={{padding:12, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform:"uppercase", color:"var(--ink-500)"}}>Αίθουσα</div>
          <div className="hours">
            {Array(totalH).fill(0).map((_, i) => <div key={i}>{String(startHour + i).padStart(2,"0")}:00</div>)}
          </div>
        </div>
        {rooms.map(room => {
          const ops = dailyOps.filter(s => s.room === room);
          return (
            <div key={room} className="gantt-row">
              <div className="room-label"><Icon name="scalpel" size={12}/>{room}</div>
              <div className="track">
                {ops.map(op => {
                  const [d, t] = op.start.split(" ");
                  const [h, m] = t.split(":").map(Number);
                  const hourFrac = h + (m/60);
                  const left = ((hourFrac - startHour) / totalH) * 100;
                  const width = (op.dur / totalH) * 100;
                  const surgeon = DOCTORS.find(d => d.id === op.surgeon);
                  
                  return (
                    <div key={op.id} 
                         onClick={() => onPatientOpen(op.patient_AMKA)}
                         title={`${op.name} (${op.patient})`}
                         className={"gantt-block " + (op.category === "Επείγον" ? "cat-emergency" : op.category === "Β" ? "cat-b" : "")} 
                         style={{
                           left: Math.max(0, left) + "%", 
                           width: Math.max(1, width) + "%", // Min width of 1%
                           minWidth: 30, // Min pixel width for tiny blocks
                           cursor:"pointer",
                           background: op.category === 'C' ? 'var(--red-500)' : op.category === 'B' ? 'var(--violet-500)' : 'var(--brand-500)',
                           display: "flex",
                           flexDirection: "column",
                           justifyContent: "center",
                           padding: "2px 4px",
                           overflow: "hidden"
                         }}>
                      <div className="block-title" style={{fontSize: 9, fontWeight: 700, lineHeight: 1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{op.name}</div>
                      {width > 5 && <div className="block-meta" style={{fontSize: 8, opacity: 0.8, whiteSpace:"nowrap"}}>{op.patient.split(" ")[1]}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {dailyOps.length === 0 && (
        <div className="card" style={{padding: 80, textAlign: "center", marginTop: 20}}>
          <Icon name="calendar" size={40} style={{opacity: 0.1, marginBottom: 16}}/><br/>
          <div className="muted">Δεν υπάρχουν προγραμματισμένα χειρουργεία για την ημερομηνία {selectedDate}.</div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Staff, Hierarchy, Shifts, Hospitalizations, Prescriptions, OperatingRooms });
