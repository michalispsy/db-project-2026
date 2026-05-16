/* Pages part 3: Public Portal, Departments, Doctors, Review, QueryExplorer */

/* ─────────── PUBLIC PORTAL ─────────── */
const PublicPortal = ({ onNav }) => (
  <div style={{maxWidth: 800, margin: "40px auto"}}>
    <div style={{textAlign: "center", marginBottom: 60}}>
      <div className="avatar" style={{width: 80, height: 80, fontSize: 32, margin: "0 auto 20px", background: "var(--brand-500)", color: "#fff"}}>Υ</div>
      <h1 style={{fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 16px"}}>Υγειόπολη</h1>
      <p style={{fontSize: 18, color: "var(--ink-600)", lineHeight: 1.6}}>Η πύλη πληροφόρησης για τους πολίτες και τους ασθενείς του νοσοκομείου μας.</p>
    </div>
    
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20}}>
      <div className="card portal-card" onClick={() => onNav("departments")}>
        <div className="icon"><Icon name="grid" size={32}/></div>
        <h3>Κλινικές & Τμήματα</h3>
        <p>Ενημερωθείτε για τα τμήματα, τους χώρους και τις παρεχόμενες υπηρεσίες.</p>
      </div>
      <div className="card portal-card" onClick={() => onNav("doctors")}>
        <div className="icon"><Icon name="user" size={32}/></div>
        <h3>Ιατρικό Προσωπικό</h3>
        <p>Αναζητήστε τους γιατρούς μας ανά ειδικότητα και δείτε το βιογραφικό τους.</p>
      </div>
      <div className="card portal-card" onClick={() => onNav("review")}>
        <div className="icon"><Icon name="star" size={32}/></div>
        <h3>Αξιολόγηση Υπηρεσιών</h3>
        <p>Η γνώμη σας μετράει. Πείτε μας για την εμπειρία σας στο νοσοκομείο.</p>
      </div>
      <div className="card portal-card" style={{opacity: 0.6, cursor: "not-allowed"}}>
        <div className="icon"><Icon name="calendar" size={32}/></div>
        <h3>e-Ραντεβού</h3>
        <p>Σύντομα διαθέσιμη η υπηρεσία ηλεκτρονικού προγραμματισμού επισκέψεων.</p>
      </div>
    </div>
  </div>
);

/* ─────────── DEPARTMENTS (PUBLIC) ─────────── */
const Departments = () => {
  const { DEPARTMENTS } = window.UG;
  return (
    <div>
      <PageHeader
        title="Κλινικές & Τμήματα"
        subtitle="Τα ιατρικά τμήματα της Υγειόπολης και οι υπηρεσίες τους"
      />
      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20}}>
        {DEPARTMENTS.map(d => (
          <div key={d.id} className="card dept-card" style={{padding: 0, overflow: "hidden"}}>
            <div className="ph-img" style={{height: 120, fontSize: 12}}>
              <Icon name="hospital" size={40} style={{opacity: 0.2, marginBottom: 12}}/>
            </div>
            <div style={{padding: 16}}>
              <div className="hstack" style={{justifyContent:"space-between", marginBottom: 4}}>
                <div style={{fontWeight: 600, fontSize: 15}}>{window.DEPT_GREEK[d.name] || d.name}</div>
                <span className="chip">{d.beds} κλίνες</span>
              </div>
              <div className="muted" style={{fontSize: 12, marginBottom: 10, lineHeight: 1.4, minHeight: 32}}>{d.desc}</div>
              <div style={{borderTop:"1px solid var(--ink-150)", paddingTop: 10, fontSize: 12}}>
                <div className="hstack" style={{justifyContent:"space-between", color:"var(--ink-600)", marginBottom: 4}}>
                  <span>Διευθυντής</span><strong style={{color:"var(--ink-800)"}}>{d.director.replace("Δρ. ","")}</strong>
                </div>
                <div className="hstack" style={{justifyContent:"space-between", color:"var(--ink-600)"}}>
                  <span>Τοποθεσία</span><strong style={{color:"var(--ink-800)"}}>{d.building} · Όροφος {d.floor}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── DOCTORS (PUBLIC) ─────────── */
const DoctorProfiles = () => {
  const { DOCTORS, DEPARTMENTS } = window.UG;
  const RANK_GREEK = { "Director": "Διευθυντής", "Senior Attending": "Επιμελητής Α", "Junior Attending": "Επιμελητής Β", "Resident": "Ειδικευόμενος" };
  
  return (
    <div>
      <PageHeader
        title="Ιατρικό Προσωπικό"
        subtitle="Οι εξειδικευμένοι επιστήμονες που φροντίζουν για την υγεία σας"
      />
      <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20}}>
        {DOCTORS.map(d => {
          const depts = (d.deptIds || []).map(id => DEPARTMENTS.find(x => String(x.id || x.dept_id) === String(id))).filter(Boolean);
          const deptNames = depts.map(d => window.DEPT_GREEK[d.name] || d.name).join(", ");
          
          return (
            <div key={d.id} className="card hstack" style={{padding: 16, gap: 16, alignItems: "center"}}>
              <div className="avatar" style={{width: 64, height: 64, fontSize: 22, flexShrink: 0, overflow: "hidden", background: "var(--brand-100)", color: "var(--brand-700)"}}>
                {d.img ? (
                  <img src={d.img} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                ) : (
                  d.name.split(" ").map(s=>s[0]).slice(0,2).join("")
                )}
              </div>
              <div style={{flex: 1, overflow: "hidden"}}>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em"}}>Δρ. {d.name}</div>
                <div className="muted" style={{fontSize: 13, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  {RANK_GREEK[d.rank] || d.rank} · {deptNames}
                </div>
                <div style={{marginTop: 12, display: "flex", gap: 6}}>
                  <button className="btn btn-ghost" style={{padding: "4px 10px", fontSize: 11}}>Προφίλ</button>
                  <button className="btn btn-primary" style={{padding: "4px 10px", fontSize: 11}}>e-Ραντεβού</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
/* ─────────── DRUGS ─────────── */
const Drugs = () => {
  const { DRUGS } = window.UG;
  const [search, setSearch] = React.useState("");
  
  const filtered = DRUGS.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.substance.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // Performance: Show only first 50 results

  return (
    <div>
      <PageHeader 
        title="Φαρμακείο & Αποθήκη" 
        subtitle="Διαχείριση αποθέματος και ευρετήριο δραστικών ουσιών"
        actions={<button className="btn btn-primary"><Icon name="plus" size={14}/>Νέο Φάρμακο</button>}
      />
      
      <div className="card" style={{padding: "16px 20px", marginBottom: 20, background: "var(--ink-50)"}}>
        <div className="hstack" style={{justifyContent: "space-between", gap: 16}}>
          <div style={{position:"relative", maxWidth: 400, flex: 1}}>
            <Icon name="search" size={14} style={{position:"absolute", left: 10, top: 10, color: "var(--ink-400)"}}/>
            <input 
              className="input" 
              placeholder="Αναζήτηση φαρμάκου ή εταιρείας..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{paddingLeft: 32}}
            />
          </div>
          <div className="muted" style={{fontSize: 12}}>
            Εμφάνιση {filtered.length} από {DRUGS.length} φάρμακα
          </div>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 60}}>ID</th>
              <th style={{width: 80}}>Εικόνα</th>
              <th>Ονομασία Φαρμάκου</th>
              <th>Κατασκευαστής / Δραστική</th>
              <th>Τύπος</th>
              <th>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td className="mono muted">{d.id}</td>
                <td>
                  <div style={{width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: "var(--ink-100)", border: "1px solid var(--ink-200)"}}>
                    {d.img ? (
                      <img src={d.img} alt={d.name} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                    ) : (
                      <div className="hstack" style={{justifyContent: "center", height: "100%", color: "var(--ink-400)"}}><Icon name="pill" size={20}/></div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{fontWeight: 700, fontSize: 15, color: "var(--brand-700)"}}>{d.name}</div>
                  <div className="muted" style={{fontSize: 10}}>Κωδικός: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                </td>
                <td>{d.substance}</td>
                <td><span className="chip chip-ink">Σκεύασμα</span></td>
                <td>
                  <div className="hstack" style={{gap: 8}}>
                    <button className="btn btn-ghost" style={{padding: "6px"}} title="Προβολή"><Icon name="search" size={12}/></button>
                    <button className="btn btn-ghost" style={{padding: "6px"}} title="Επεξεργασία"><Icon name="edit" size={12}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─────────── REVIEW ─────────── */
const ReviewForm = () => (
  <div style={{maxWidth: 600, margin: "20px auto"}}>
    <PageHeader
      title="Αξιολόγηση Υπηρεσιών"
      subtitle="Βοηθήστε μας να γίνουμε καλύτεροι"
    />
    <div className="card" style={{padding: 30}}>
      <div style={{textAlign: "center", marginBottom: 30}}>
        <div style={{fontSize: 32, marginBottom: 12}}>⭐⭐⭐⭐⭐</div>
        <p className="muted">Πώς ήταν η εμπειρία σας στο νοσοκομείο μας;</p>
      </div>
      
      <div style={{display: "grid", gap: 20}}>
        <div>
          <label className="field-label">Τμήμα που επισκεφθήκατε</label>
          <select className="select"><option>Επιλέξτε τμήμα...</option><option>Καρδιολογικό</option><option>Χειρουργικό</option></select>
        </div>
        <div>
          <label className="field-label">Βαθμολογία</label>
          <div className="hstack" style={{gap: 10}}>
            {[1,2,3,4,5].map(n => <button key={n} className="btn btn-ghost" style={{flex: 1, fontSize: 16}}>{n}</button>)}
          </div>
        </div>
        <div>
          <label className="field-label">Σχόλια & Παρατηρήσεις</label>
          <textarea className="input" rows={4} placeholder="Περιγράψτε την εμπειρία σας..."></textarea>
        </div>
        <button className="btn btn-primary" style={{width: "100%", padding: 14, fontSize: 15, marginTop: 10}}>Υποβολή Αξιολόγησης</button>
      </div>
    </div>
  </div>
);

/* ─────────── QUERY EXPLORER ─────────── */
const QueryExplorer = () => {
  const { QUERIES } = window.UG;
  const [selected, setSelected] = React.useState(QUERIES[0] || null);
  const [results, setResults] = React.useState(null);

  const runQuery = (q) => {
    setSelected(q);
    setResults({ loading: true });
    // Mock run
    setTimeout(() => {
      setResults({
        headers: ["Τμήμα", "Μέσος Όρος Ημερών Νοσηλείας", "Πλήθος Περιστατικών"],
        rows: [
          ["Καρδιολογικό", "4.2", "156"],
          ["Χειρουργικό", "5.8", "89"],
          ["Παθολογικό", "6.1", "210"]
        ]
      });
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="SQL Query Explorer"
        subtitle="Εκτέλεση προκαθορισμένων queries (Assignment Q01-Q15)"
      />
      <div style={{display: "grid", gridTemplateColumns: "350px 1fr", gap: 20}}>
        <div className="vstack" style={{gap: 12}}>
          {QUERIES.map(q => (
            <div key={q.id} className={"card query-card" + (selected?.id === q.id ? " active" : "")} onClick={() => runQuery(q)}>
              <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                <span className="mono" style={{fontWeight: 700}}>{q.id}</span>
                <Icon name="play" size={12}/>
              </div>
              <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4}}>{q.title}</div>
              <div className="muted" style={{fontSize: 11}}>{q.desc}</div>
            </div>
          ))}
        </div>
        
        <div className="vstack" style={{gap: 20}}>
          <div className="card" style={{padding: 20, background: "#1e1e1e", color: "#d4d4d4", borderRadius: 8}}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 12}}>
              <span style={{fontSize: 11, fontWeight: 600, color: "#858585"}}>SQL SOURCE</span>
              <button className="btn btn-ghost" style={{fontSize: 10, padding: "2px 6px", color: "#858585"}}>Copy</button>
            </div>
            <pre className="mono" style={{fontSize: 13, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap"}}>
              {selected?.sql || "-- Select a query from the sidebar"}
            </pre>
          </div>
          
          <div className="card">
            <div style={{padding: "12px 18px", borderBottom: "1px solid var(--ink-150)", fontWeight: 600, fontSize: 13}}>Query Results</div>
            {results?.loading ? (
              <div style={{padding: 60, textAlign:"center"}}><span className="spinner"/></div>
            ) : results ? (
              <table className="tbl">
                <thead><tr>{results.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {results.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}
                </tbody>
              </table>
            ) : (
              <div style={{padding: 60, textAlign:"center"}} className="muted">Run a query to see results here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PublicPortal, Departments, DoctorProfiles, ReviewForm, QueryExplorer, Drugs });
