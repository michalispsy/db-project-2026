/* App shell — sidebar + header + page routing */

const NAV_SECTIONS = [
  { label: "Διαχείριση", items: [
    { id: "dashboard", name: "Πίνακας Ελέγχου", icon: "dashboard" },
    { id: "triage", name: "Επείγοντα / Triage", icon: "siren", badge: 13 },
    { id: "patients", name: "Ασθενείς", icon: "user" },
    { id: "hospitalizations", name: "Νοσηλείες", icon: "hospital" },
    { id: "beds", name: "Κλίνες", icon: "bed" },
    { id: "prescriptions", name: "Συνταγές", icon: "pill" },
    { id: "or", name: "Χειρουργεία", icon: "scalpel" },
  ]},
  { label: "Προσωπικό", items: [
    { id: "staff", name: "Προσωπικό", icon: "users" },
    { id: "shifts", name: "Εφημερίες", icon: "calendar" },
    { id: "hierarchy", name: "Ιεραρχία", icon: "shield" },
  ]},
  { label: "Δημόσια Πύλη", items: [
    { id: "portal", name: "Αρχική", icon: "sparkle" },
    { id: "departments", name: "Τμήματα", icon: "grid" },
    { id: "doctors", name: "Γιατροί", icon: "user" },
    { id: "review", name: "Αξιολόγηση", icon: "star" },
  ]},
  { label: "Ανάπτυξη", items: [
    { id: "queries", name: "Query Explorer", icon: "sql" },
  ]},
];

const Sidebar = ({ current, onNav }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="logo">Υ</div>
      <div className="name">
        Υγειόπολη
        <small>Hospital OS</small>
      </div>
    </div>
    {NAV_SECTIONS.map((section, idx) => (
      <React.Fragment key={idx}>
        <div className="nav-section-label">{section.label}</div>
        {section.items.map(item => (
          <div
            key={item.id}
            className={"nav-item" + (current === item.id ? " active" : "")}
            onClick={() => onNav(item.id)}
            id={"nav-" + item.id}
          >
            <Icon name={item.icon} />
            <span>{item.name}</span>
            {item.badge ? <span className="badge">{item.badge}</span> : null}
          </div>
        ))}
      </React.Fragment>
    ))}
  </aside>
);

const CRUMB_LABEL = {
  dashboard: ["Διαχείριση", "Πίνακας Ελέγχου"],
  triage: ["Διαχείριση", "Επείγοντα / Triage"],
  patients: ["Διαχείριση", "Ασθενείς"],
  hospitalizations: ["Διαχείριση", "Νοσηλείες"],
  beds: ["Διαχείριση", "Διαχείριση Κλινών"],
  prescriptions: ["Διαχείριση", "Συνταγές"],
  or: ["Διαχείριση", "Χειρουργεία"],
  staff: ["Προσωπικό", "Κατάλογος"],
  shifts: ["Προσωπικό", "Εφημερίες"],
  hierarchy: ["Προσωπικό", "Ιεραρχία Επίβλεψης"],
  portal: ["Δημόσια Πύλη", "Αρχική"],
  departments: ["Δημόσια Πύλη", "Τμήματα"],
  doctors: ["Δημόσια Πύλη", "Γιατροί"],
  review: ["Δημόσια Πύλη", "Αξιολόγηση"],
  queries: ["Ανάπτυξη", "Query Explorer"],
};

const Header = ({ current }) => {
  const crumbs = CRUMB_LABEL[current] || ["—", "—"];
  return (
    <header className="app-header">
      <div className="crumbs">
        <span>{crumbs[0]}</span>
        <span className="sep"><Icon name="chevronRight" size={12}/></span>
        <strong>{crumbs[1]}</strong>
      </div>
      <div className="global-search">
        <Icon name="search" size={14}/>
        <input id="global-search-input" placeholder="Αναζήτηση ασθενών, γιατρών, ICD-10, ΑΜΚΑ…"/>
        <kbd>⌘K</kbd>
      </div>
      <div className="header-actions">
        <button className="icon-btn" id="header-help-btn" title="Βοήθεια">
          <Icon name="alert" size={16}/>
        </button>
        <button className="icon-btn" id="header-bell-btn" title="Ειδοποιήσεις">
          <Icon name="bell" size={16}/>
          <span className="dot-indicator"></span>
        </button>
        <div className="user-pill" id="header-user-pill">
          <div className="avatar">ΕΚ</div>
          <span style={{fontSize: 12, fontWeight: 500}}>Ε. Καρανίκα</span>
          <Icon name="chevronDown" size={12}/>
        </div>
      </div>
    </header>
  );
};

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
    {actions ? <div className="page-actions">{actions}</div> : null}
  </div>
);

window.Sidebar = Sidebar;
window.Header = Header;
window.PageHeader = PageHeader;
