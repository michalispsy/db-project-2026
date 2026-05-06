/* Pages part 3: Public Portal, Departments, Doctors, Review form, Query Explorer */

const P3_DPS = window.UG.DEPARTMENTS;
const P3_DXS = window.UG.DOCTORS;
const P3_REV = window.UG.REVIEWS;
const P3_QRS = window.UG.QUERIES;

/* ─────────── PUBLIC PORTAL ─────────── */
const PublicPortal = ({ onNav }) => (
  <div>
    <div className="hero">
      <div style={{maxWidth: 720}}>
        <span className="chip chip-brand mono" style={{marginBottom: 14}}>Δημόσια πύλη · Υγειόπολη</span>
        <h1 style={{fontSize: 38, fontWeight: 600, letterSpacing:"-0.03em", margin:"4px 0 12px", color:"var(--ink-900)", lineHeight: 1.05}}>
          Ψηφιακή υποδοχή και<br/>καθοδήγηση ασθενών.
        </h1>
        <p style={{fontSize: 15, color:"var(--ink-600)", margin: "0 0 24px", lineHeight: 1.55}}>
          Βρείτε γιατρό, εξερευνήστε τμήματα του νοσοκομείου, ή αξιολογήστε την εμπειρία σας μετά το εξιτήριο. Όλη η ενημέρωση σε ένα μέρος.
        </p>
        <div className="card" style={{padding: 8, display:"flex", gap: 6, alignItems:"center", maxWidth: 540, boxShadow:"var(--shadow-md)"}}>
          <div className="hstack" style={{gap: 4, padding: "0 4px 0 12px"}}>
            <Icon name="search" size={16} style={{color:"var(--ink-400)"}}/>
            <input style={{border:"none", outline:"none", padding: "10px 8px", fontSize: 14, width: 280}} placeholder="Καρδιολόγος, παιδίατρος, Παθολογική…"/>
          </div>
          <div style={{borderLeft:"1px solid var(--ink-200)", height: 24}}/>
          <select className="select" style={{border:"none", padding: "10px 8px", flex: 1}}><option>Όλα τα τμήματα</option>{P3_DPS.map(d=><option key={d.id}>{d.name}</option>)}</select>
          <button className="btn btn-primary">Αναζήτηση</button>
        </div>
        <div className="hstack" style={{marginTop: 16, gap: 16, fontSize: 12, color:"var(--ink-500)"}}>
          <span>Δημοφιλή:</span>
          {["Καρδιολογία","Παιδιατρική","Νευρολογία","ΩΡΛ","Δερματολογία"].map(t => (
            <span key={t} className="chip" style={{cursor:"pointer"}}>{t}</span>
          ))}
        </div>
      </div>
    </div>

    <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 14}}>
      {[
        { icon: "hospital", title: "Τμήματα", desc: "Όλα τα τμήματα, με φωτογραφίες & υπευθύνους.", action: "departments" },
        { icon: "user", title: "Γιατροί", desc: "Αναζητήστε ειδικότητες και κατάλογο ιατρών.", action: "doctors" },
        { icon: "star", title: "Αξιολόγηση", desc: "Μετά το εξιτήριο, μοιραστείτε την εμπειρία σας.", action: "review" },
      ].map(c => (
        <div key={c.title} className="card" style={{padding: 22, cursor:"pointer"}} onClick={() => onNav(c.action)}>
          <div style={{width: 36, height: 36, borderRadius: "var(--r-md)", background:"var(--brand-50)", color:"var(--brand-700)", display:"grid", placeItems:"center", marginBottom: 12}}>
            <Icon name={c.icon} size={18}/>
          </div>
          <div style={{fontWeight: 600, fontSize: 15, marginBottom: 4}}>{c.title}</div>
          <div className="muted" style={{fontSize: 13, lineHeight: 1.5}}>{c.desc}</div>
          <div style={{marginTop: 14, fontSize: 12, color:"var(--brand-700)", fontWeight: 500}}>Άνοιγμα →</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────── DEPARTMENTS ─────────── */
const Departments = () => (
  <div>
    <PageHeader
      title="Τμήματα"
      subtitle={P3_DPS.length + " τμήματα · ολοκληρωμένη φροντίδα κάτω από μία στέγη"}
    />
    <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 16}}>
      {P3_DPS.map(d => (
        <div key={d.id} className="card" style={{overflow:"hidden", cursor:"pointer", transition:"box-shadow 0.15s"}} id={"dept-card-" + d.id}>
          <div className="ph-img" style={{height: 130, borderRadius: 0, border: "none", borderBottom:"1px solid var(--ink-200)"}}>
            <span>{`{ ${d.name} — dept photo }`}</span>
          </div>
          <div style={{padding: 16}}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 4}}>
              <div style={{fontWeight: 600, fontSize: 15}}>{d.name}</div>
              <span className="chip">{d.beds} κλίνες</span>
            </div>
            <div className="muted" style={{fontSize: 12, marginBottom: 10, lineHeight: 1.4, minHeight: 32}}>{d.desc}</div>
            <div style={{borderTop:"1px solid var(--ink-150)", paddingTop: 10, fontSize: 12}}>
              <div className="hstack" style={{justifyContent:"space-between", color:"var(--ink-600)", marginBottom: 4}}>
                <span>Διευθυντής</span><strong style={{color:"var(--ink-800)"}}>{d.director.replace("Δρ. ","")}</strong>
              </div>
              <div className="hstack" style={{justifyContent:"space-between", color:"var(--ink-600)"}}>
                <span>Τοποθεσία</span><span className="mono">{d.floor}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────── DOCTOR PROFILES ─────────── */
const DoctorProfiles = () => {
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? P3_DXS : P3_DXS.filter(d => d.rank === filter);
  return (
    <div>
      <PageHeader
        title="Γιατροί"
        subtitle={P3_DXS.length + " γιατροί · όλες οι βαθμίδες & ειδικότητες"}
      />
      <div className="hstack" style={{gap: 8, marginBottom: 16, flexWrap:"wrap"}}>
        {["all","Διευθυντής","Επιμελητής Α΄","Επιμελητής Β΄","Ειδικευόμενος"].map(r => (
          <button key={r} className={"btn " + (filter === r ? "btn-primary" : "btn-ghost")} onClick={() => setFilter(r)}>
            {r === "all" ? "Όλοι" : r}
          </button>
        ))}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 12}}>
        {filtered.map(d => {
          const dept = P3_DPS.find(x => x.id === d.deptId);
          return (
            <div key={d.id} className="card" style={{padding: 16, textAlign:"center"}}>
              <div className="ph-img" style={{width: 84, height: 84, borderRadius: 999, margin: "0 auto 10px", fontSize: 9}}>
                <span>{d.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</span>
              </div>
              <div style={{fontWeight: 600, fontSize: 14}}>Δρ. {d.name}</div>
              <div className="muted" style={{fontSize: 12, margin:"2px 0 8px"}}>{d.spec}</div>
              <span className={"chip " + (d.rank === "Διευθυντής" ? "chip-brand" : d.rank === "Επιμελητής Α΄" ? "chip-violet" : d.rank === "Ειδικευόμενος" ? "chip-amber" : "")}>{d.rank}</span>
              <div style={{borderTop:"1px solid var(--ink-150)", marginTop: 12, paddingTop: 10, fontSize: 11, color:"var(--ink-500)", display:"flex", justifyContent:"space-between"}}>
                <span className="mono">{d.lic}</span>
                <span>{dept?.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── REVIEW FORM ─────────── */
const REVIEW_CRITERIA = [
  "Ποιότητα ιατρικής φροντίδας",
  "Ποιότητα νοσηλευτικής φροντίδας",
  "Καθαριότητα",
  "Φαγητό",
  "Συνολική εμπειρία",
];

const ReviewForm = () => {
  const [scores, setScores] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div>
        <PageHeader title="Αξιολόγηση εξιτηρίου"/>
        <div className="card" style={{padding: 40, textAlign:"center", maxWidth: 520, margin: "0 auto"}}>
          <div style={{width: 56, height: 56, borderRadius: 999, background:"var(--green-100)", color:"var(--green-600)", display:"grid", placeItems:"center", margin:"0 auto 16px"}}>
            <Icon name="check" size={26}/>
          </div>
          <h2 style={{margin:"0 0 8px", fontSize: 20, letterSpacing:"-0.02em"}}>Ευχαριστούμε!</h2>
          <p className="muted" style={{margin: 0}}>Η αξιολόγησή σας υποβλήθηκε ανώνυμα και θα βοηθήσει στη βελτίωση των υπηρεσιών μας.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Αξιολόγηση εξιτηρίου"
        subtitle="Παρακαλούμε βαθμολογήστε την εμπειρία σας. Οι απαντήσεις είναι ανώνυμες."
      />
      <div className="card" style={{padding: 28, maxWidth: 720, margin: "0 auto"}}>
        <div className="hstack" style={{justifyContent:"space-between", marginBottom: 22, paddingBottom: 14, borderBottom:"1px solid var(--ink-150)"}}>
          <div>
            <div style={{fontWeight: 600, fontSize: 15}}>Νοσηλεία H-21878</div>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Καρδιολογική · 22 — 29 Νοε 2025</div>
          </div>
          <span className="chip chip-green">Εξιτήριο</span>
        </div>

        {REVIEW_CRITERIA.map((c, i) => (
          <div key={c} style={{padding: "16px 0", borderBottom: i < REVIEW_CRITERIA.length-1 ? "1px solid var(--ink-150)" : "none"}}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 10}}>
              <div style={{fontWeight: 500, fontSize: 14}}>{c}</div>
              <div className="muted" style={{fontSize: 11}}>1 — Πολύ κακό · 5 — Άριστο</div>
            </div>
            <div className="likert">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={scores[c] === n ? "selected" : ""} onClick={() => setScores({...scores, [c]: n})} id={"rate-" + i + "-" + n}>{n}</button>
              ))}
            </div>
          </div>
        ))}

        <div style={{padding: "18px 0", borderTop:"1px solid var(--ink-150)", marginTop: 8}}>
          <label className="field-label">Σχόλια (προαιρετικά)</label>
          <textarea className="textarea" rows={3} placeholder="Πείτε μας περισσότερα…"></textarea>
        </div>

        <div className="hstack" style={{justifyContent:"flex-end", gap: 8}}>
          <button className="btn btn-ghost">Ακύρωση</button>
          <button className="btn btn-primary" onClick={() => setSubmitted(true)} disabled={Object.keys(scores).length < 5} id="review-submit">
            <Icon name="check" size={14}/>Υποβολή
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────── QUERY EXPLORER ─────────── */

const SQL_SAMPLES = {
  Q01: `-- Q01: Ασθενείς με ≥2 νοσηλείες στο ίδιο τμήμα\n-- εντός του τελευταίου χρόνου, με συνολικό κόστος\nSELECT p.amka, p.last_name, p.first_name,\n       d.name AS department,\n       COUNT(*)         AS times_admitted,\n       SUM(h.total_cost) AS total_cost\nFROM hospitalizations h\n  JOIN patients    p ON p.id = h.patient_id\n  JOIN departments d ON d.id = h.dept_id\nWHERE h.admit_date >= CURRENT_DATE - INTERVAL '1 year'\nGROUP BY p.amka, p.last_name, p.first_name, d.name\nHAVING COUNT(*) >= 2\nORDER BY times_admitted DESC, total_cost DESC;`,
  Q04: `-- Q04: Μέσο κόστος νοσηλείας ανά τμήμα/εξάμηνο\nSELECT d.name AS dept,\n       EXTRACT(YEAR FROM h.admit_date)  AS y,\n       CASE WHEN EXTRACT(MONTH FROM h.admit_date) <= 6 THEN 1 ELSE 2 END AS sem,\n       k.code AS ken_code,\n       AVG(h.total_cost) AS avg_cost,\n       COUNT(*)          AS n\nFROM hospitalizations h\n  JOIN departments d ON d.id = h.dept_id\n  JOIN ken_codes  k ON k.code = h.ken_code\nGROUP BY d.name, y, sem, k.code\nORDER BY y DESC, sem, dept;`,
  Q13: `-- Q13: Πλήρης ιεραρχία επίβλεψης\nWITH RECURSIVE chain AS (\n  SELECT id, full_name, supervisor_id, 0 AS depth,\n         CAST(full_name AS TEXT) AS path\n  FROM doctors\n  WHERE supervisor_id IS NULL\n  UNION ALL\n  SELECT d.id, d.full_name, d.supervisor_id, c.depth + 1,\n         c.path || ' › ' || d.full_name\n  FROM doctors d\n    JOIN chain c ON c.id = d.supervisor_id\n)\nSELECT id, full_name, depth, path\nFROM chain\nORDER BY path;`,
};

const Q01_RESULTS = [
  ["12048501231","Ραπτόπουλος Δ.","Καρδιολογική",2,7370],
  ["08019301129","Βαρθαλίτης Ν.","Παθολογική",3,6210],
  ["29078801874","Καραμίντα Σ.","Παιδιατρική",2,3120],
  ["41023105533","Λαμπρίδου Α.","Παθολογική",2,4450],
  ["55089910072","Νικολαΐδης Β.","Καρδιολογική",2,8910],
];

const highlight = (sql) => sql
  .replace(/--.*/g, m => `<span class="com">${m}</span>`)
  .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|GROUP BY|ORDER BY|HAVING|AS|ON|AND|OR|WITH|RECURSIVE|UNION|ALL|CASE|WHEN|THEN|ELSE|END|INTERVAL|EXTRACT|CURRENT_DATE|CAST|TEXT|NULL|IS)\b/g, '<span class="kw">$1</span>')
  .replace(/\b(COUNT|SUM|AVG|MAX|MIN)\b/g, '<span class="fn">$1</span>')
  .replace(/'[^']*'/g, m => `<span class="str">${m}</span>`)
  .replace(/\b\d+\b/g, m => `<span class="num">${m}</span>`);

const QueryExplorer = () => {
  const [active, setActive] = React.useState("Q01");
  const [showSql, setShowSql] = React.useState(true);
  const q = P3_QRS.find(x => x.id === active);
  const sql = SQL_SAMPLES[active] || `-- ${active} sample query\nSELECT * FROM ${active.toLowerCase()}_view LIMIT 20;`;

  return (
    <div>
      <PageHeader
        title="Query Explorer"
        subtitle="15 ερωτήματα assignment · raw SQL μέσω REST endpoint, χωρίς ORM"
        actions={<button className="btn btn-ghost"><Icon name="download" size={14}/>Εξαγωγή όλων</button>}
      />
      <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap: 16}}>
        <div className="card" style={{padding: 6, height:"fit-content", position:"sticky", top: 80}}>
          <div style={{padding:"10px 12px", fontWeight: 600, fontSize: 12, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--ink-500)"}}>Όλα τα ερωτήματα</div>
          {P3_QRS.map(q => (
            <div key={q.id}
                 onClick={() => setActive(q.id)}
                 id={"qry-" + q.id}
                 style={{padding: "10px 12px", borderRadius:"var(--r-sm)", cursor:"pointer", display:"flex", gap: 10, fontSize: 13, background: active === q.id ? "var(--brand-50)" : "transparent", color: active === q.id ? "var(--brand-700)" : "var(--ink-700)"}}>
              <span className="mono" style={{fontWeight: 600, fontSize: 11, paddingTop: 1}}>{q.id}</span>
              <div style={{flex: 1}}>
                <div style={{lineHeight: 1.4}}>{q.title}</div>
                <div className="hstack" style={{gap: 4, marginTop: 4}}>
                  {q.parametric && <span className="chip chip-amber" style={{fontSize: 9}}>params</span>}
                  {q.explainable && <span className="chip chip-violet" style={{fontSize: 9}}>EXPLAIN</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{padding: 22, marginBottom: 14}}>
            <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
              <div className="hstack" style={{gap: 10}}>
                <span className="chip chip-brand mono">{q.id}</span>
                <h2 style={{margin: 0, fontSize: 17, letterSpacing:"-0.01em"}}>{q.title}</h2>
              </div>
              <div className="hstack" style={{gap: 6}}>
                <button className="btn btn-ghost" onClick={() => setShowSql(!showSql)}><Icon name="code" size={14}/>{showSql ? "Απόκρ." : "Δες"} SQL</button>
                <button className="btn btn-primary"><Icon name="play" size={11}/>Run</button>
              </div>
            </div>

            {q.parametric && (
              <div className="hstack" style={{gap: 10, padding: "12px 0 0", flexWrap:"wrap"}}>
                {q.params.map(p => (
                  <div key={p} style={{flex:"1 1 200px"}}>
                    <label className="field-label">{p}</label>
                    <input className="input" placeholder={p}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showSql && (
            <div className="card" style={{padding: 0, marginBottom: 14, overflow:"hidden"}}>
              <div className="hstack" style={{padding: "10px 14px", borderBottom: "1px solid var(--ink-150)", background:"var(--ink-50)"}}>
                <Icon name="code" size={14} style={{color:"var(--ink-500)"}}/>
                <span style={{fontSize: 12, fontWeight: 500}}>Raw SQL</span>
                <span className="muted" style={{fontSize: 11, marginLeft: 8}}>· δημιουργήθηκε από REST endpoint /api/queries/{q.id.toLowerCase()}</span>
              </div>
              <pre className="codeblock" style={{margin: 0, borderRadius: 0}} dangerouslySetInnerHTML={{__html: highlight(sql)}}/>
            </div>
          )}

          {q.explainable && (
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, marginBottom: 14}}>
              <div className="card" style={{padding: 14}}>
                <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                  <strong style={{fontSize: 13}}>EXPLAIN ANALYZE</strong>
                  <span className="chip chip-amber mono">142.7 ms</span>
                </div>
                <pre style={{margin: 0, fontSize: 11, fontFamily:"var(--font-mono)", color:"var(--ink-700)", whiteSpace:"pre-wrap", lineHeight: 1.4}}>{`HashAggregate  (cost=2840.5..3110.2)
  ->  Hash Join  (cost=420.7..2103.9)
       Hash Cond: (h.dept_id = d.id)
        ->  Seq Scan on hospitalizations h
              (cost=0..1820.3 rows=98214)
        ->  Hash  (cost=410..410 rows=8)`}</pre>
              </div>
              <div className="card" style={{padding: 14, borderColor: "var(--brand-100)"}}>
                <div className="hstack" style={{justifyContent:"space-between", marginBottom: 6}}>
                  <strong style={{fontSize: 13}}>FORCE INDEX (idx_dept_admit)</strong>
                  <span className="chip chip-green mono">38.4 ms</span>
                </div>
                <pre style={{margin: 0, fontSize: 11, fontFamily:"var(--font-mono)", color:"var(--ink-700)", whiteSpace:"pre-wrap", lineHeight: 1.4}}>{`HashAggregate  (cost=910..1140)
  ->  Index Scan using idx_dept_admit
       on hospitalizations h
       (cost=0.42..640 rows=22014)
  ->  Hash Join  (cost=80..220)`}</pre>
              </div>
            </div>
          )}

          <div className="card">
            <div className="hstack" style={{padding: "12px 16px", borderBottom: "1px solid var(--ink-150)", background:"var(--ink-50)"}}>
              <strong style={{fontSize: 13}}>Αποτελέσματα</strong>
              <span className="chip">{Q01_RESULTS.length} γραμμές</span>
              <span className="chip chip-green mono">53 ms</span>
              <div className="spacer"/>
              <button className="btn btn-ghost" style={{fontSize: 12, padding:"4px 10px"}}><Icon name="download" size={12}/>CSV</button>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>amka</th><th>name</th><th>department</th><th style={{textAlign:"right"}}>times_admitted</th><th style={{textAlign:"right"}}>total_cost</th></tr>
              </thead>
              <tbody>
                {Q01_RESULTS.map(r => (
                  <tr key={r[0]}>
                    <td className="mono">{r[0]}</td>
                    <td><strong>{r[1]}</strong></td>
                    <td>{r[2]}</td>
                    <td className="mono" style={{textAlign:"right"}}>{r[3]}</td>
                    <td className="mono" style={{textAlign:"right"}}>{r[4].toLocaleString("el-GR")} €</td>
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

Object.assign(window, { PublicPortal, Departments, DoctorProfiles, ReviewForm, QueryExplorer });
