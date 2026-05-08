/* Main app shell — routing + tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "aesthetic": "default",
  "density": "comfortable",
  "showWarnings": true
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState("dashboard");
  const [patientId, setPatientId] = React.useState(null);
  const [dataVersion, setDataVersion] = React.useState(0);

  React.useEffect(() => {
    const fetchData = () => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/data', true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            window.UG = JSON.parse(xhr.responseText);
            setDataVersion(v => v + 1); // Trigger re-render
          }
        };
        xhr.send(null);
      } catch (e) {
        console.error("Failed to poll data:", e);
      }
    };

    // Initial fetch
    fetchData();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    document.body.classList.toggle("aesthetic-dense", tw.aesthetic === "dense");
    document.body.classList.toggle("aesthetic-warm", tw.aesthetic === "warm");
    document.body.classList.toggle("aesthetic-bold", tw.aesthetic === "bold");
  }, [tw.aesthetic]);

  const goTo = (p) => { setPage(p); setPatientId(null); window.scrollTo(0, 0); };

  let content;
  const onPatientOpen = (id) => setPatientId(id);

  if (patientId) content = <PatientDetail patientId={patientId} onBack={() => setPatientId(null)}/>;
  else if (page === "dashboard") content = <Dashboard onPatientOpen={onPatientOpen}/>;
  else if (page === "triage") content = <Triage onAdmit={() => alert("Δημιουργία νοσηλείας — δημόσιο prototype")}/>;
  else if (page === "patients") content = <Patients onOpen={onPatientOpen}/>;
  else if (page === "hospitalizations") content = <Hospitalizations onPatientOpen={onPatientOpen}/>;
  else if (page === "beds") content = <Beds onPatientOpen={onPatientOpen}/>;
  else if (page === "prescriptions") content = <Prescriptions/>;
  else if (page === "or") content = <OperatingRooms onPatientOpen={onPatientOpen}/>;
  else if (page === "staff") content = <Staff/>;
  else if (page === "shifts") content = <Shifts/>;
  else if (page === "hierarchy") content = <Hierarchy/>;
  else if (page === "portal") content = <PublicPortal onNav={goTo}/>;
  else if (page === "departments") content = <Departments/>;
  else if (page === "doctors") content = <DoctorProfiles/>;
  else if (page === "review") content = <ReviewForm/>;
  else if (page === "queries") content = <QueryExplorer/>;

  return (
    <>
      <div className="app" data-screen-label={page}>
        <Sidebar current={page} onNav={goTo}/>
        <div className="main">
          <Header current={page}/>
          <div className="page">{content}</div>
        </div>
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection title="Αισθητική">
          <TweakSelect label="Παλέτα / aesthetic" value={tw.aesthetic} onChange={v => setTweak('aesthetic', v)} options={[
            { label: "Modern (μπλε υγείας)", value: "default" },
            { label: "Warm (teal)", value: "warm" },
            { label: "Bold (indigo)", value: "bold" },
          ]}/>
          <TweakRadio label="Πυκνότητα" value={tw.density} onChange={v => setTweak('density', v)} options={[
            { label: "Άνετη", value: "comfortable" },
            { label: "Πυκνή", value: "dense" },
          ]}/>
        </TweakSection>
        <TweakSection title="Λειτουργικότητα">
          <TweakToggle label="Εμφάνιση προειδοποιήσεων προγραμματισμού" value={tw.showWarnings} onChange={v => setTweak('showWarnings', v)}/>
        </TweakSection>
        <TweakSection title="Πλοήγηση">
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 6}}>
            {["dashboard","triage","patients","beds","prescriptions","or","shifts","hierarchy","portal","departments","doctors","review","queries"].map(p => (
              <TweakButton key={p} onClick={() => goTo(p)}>{CRUMB_LABEL[p]?.[1] || p}</TweakButton>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// React.useEffect once — set body class based on initial tweak aesthetic from localStorage if any
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
