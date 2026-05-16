// Mock data for Υγειόπολη — realistic densities (15-30 rows where appropriate)

const DEPARTMENTS = [
  { id: 1, name: "Καρδιολογική", desc: "Καρδιακή φροντίδα και επεμβατική καρδιολογία.", beds: 24, floor: "3ος όρ., Κτ. Α", director: "Δρ. Ανδρέας Παπαδημητρίου", icon: "heart" },
  { id: 2, name: "Παθολογική", desc: "Γενική εσωτερική παθολογία ενηλίκων.", beds: 36, floor: "2ος όρ., Κτ. Α", director: "Δρ. Ελένη Σταυροπούλου", icon: "stethoscope" },
  { id: 3, name: "Χειρουργική", desc: "Γενική και ορθοπεδική χειρουργική.", beds: 28, floor: "4ος όρ., Κτ. Β", director: "Δρ. Νικόλαος Βλάχος", icon: "scalpel" },
  { id: 4, name: "Παιδιατρική", desc: "Φροντίδα νεογνών, βρεφών και παιδιών.", beds: 20, floor: "1ος όρ., Κτ. Γ", director: "Δρ. Μαρία Καρρά", icon: "baby" },
  { id: 5, name: "Νευρολογική", desc: "Διαταραχές νευρικού συστήματος.", beds: 16, floor: "3ος όρ., Κτ. Β", director: "Δρ. Παύλος Λαμπρίδης", icon: "brain" },
  { id: 6, name: "Ογκολογική", desc: "Συμπεριφορά κακοηθών νεοπλασιών.", beds: 22, floor: "5ος όρ., Κτ. Α", director: "Δρ. Σοφία Κωνσταντίνου", icon: "ribbon" },
  { id: 7, name: "Μ.Ε.Θ.", desc: "Μονάδα Εντατικής Θεραπείας.", beds: 12, floor: "Ισόγειο, Κτ. Γ", director: "Δρ. Στέλιος Δημητρίου", icon: "pulse" },
  { id: 8, name: "Επείγοντα", desc: "Τμήμα Επειγόντων Περιστατικών.", beds: 10, floor: "Ισόγειο, Κτ. Α", director: "Δρ. Ιωάννα Μάρκου", icon: "siren" },
];

const DOCTORS = [
  { id: "d01", name: "Ανδρέας Παπαδημητρίου", lic: "ΙΑ-12044", spec: "Καρδιολογία", rank: "Διευθυντής", deptId: 1, supervisorId: null, surgeries: 18 },
  { id: "d02", name: "Ελένη Σταυροπούλου", lic: "ΙΑ-15877", spec: "Παθολογία", rank: "Διευθυντής", deptId: 2, supervisorId: null, surgeries: 0 },
  { id: "d03", name: "Νικόλαος Βλάχος", lic: "ΙΑ-09221", spec: "Γενική Χειρουργική", rank: "Διευθυντής", deptId: 3, supervisorId: null, surgeries: 41 },
  { id: "d04", name: "Μαρία Καρρά", lic: "ΙΑ-17542", spec: "Παιδιατρική", rank: "Διευθυντής", deptId: 4, supervisorId: null, surgeries: 4 },
  { id: "d05", name: "Παύλος Λαμπρίδης", lic: "ΙΑ-13301", spec: "Νευρολογία", rank: "Διευθυντής", deptId: 5, supervisorId: null, surgeries: 8 },
  { id: "d06", name: "Σοφία Κωνσταντίνου", lic: "ΙΑ-11997", spec: "Ογκολογία", rank: "Διευθυντής", deptId: 6, supervisorId: null, surgeries: 0 },
  { id: "d07", name: "Στέλιος Δημητρίου", lic: "ΙΑ-08442", spec: "Εντατικολογία", rank: "Διευθυντής", deptId: 7, supervisorId: null, surgeries: 0 },
  { id: "d08", name: "Γεώργιος Αντωνίου", lic: "ΙΑ-19031", spec: "Καρδιολογία", rank: "Επιμελητής Α΄", deptId: 1, supervisorId: "d01", surgeries: 12 },
  { id: "d09", name: "Δήμητρα Παπαγιάννη", lic: "ΙΑ-19821", spec: "Καρδιολογία", rank: "Επιμελητής Β΄", deptId: 1, supervisorId: "d08", surgeries: 7 },
  { id: "d10", name: "Κωνσταντίνος Ροζάκης", lic: "ΙΑ-20451", spec: "Καρδιολογία", rank: "Ειδικευόμενος", deptId: 1, supervisorId: "d09", surgeries: 2 },
  { id: "d11", name: "Αναστασία Τσούκα", lic: "ΙΑ-18221", spec: "Παθολογία", rank: "Επιμελητής Α΄", deptId: 2, supervisorId: "d02", surgeries: 0 },
  { id: "d12", name: "Φώτιος Καρανίκας", lic: "ΙΑ-19115", spec: "Παθολογία", rank: "Επιμελητής Β΄", deptId: 2, supervisorId: "d11", surgeries: 0 },
  { id: "d13", name: "Χρυσούλα Νικολάου", lic: "ΙΑ-20910", spec: "Παθολογία", rank: "Ειδικευόμενος", deptId: 2, supervisorId: "d12", surgeries: 0 },
  { id: "d14", name: "Δημήτρης Σαββίδης", lic: "ΙΑ-12891", spec: "Γενική Χειρουργική", rank: "Επιμελητής Α΄", deptId: 3, supervisorId: "d03", surgeries: 33 },
  { id: "d15", name: "Νεφέλη Ζαφειρίου", lic: "ΙΑ-19009", spec: "Ορθοπεδική", rank: "Επιμελητής Α΄", deptId: 3, supervisorId: "d03", surgeries: 28 },
  { id: "d16", name: "Αλέξανδρος Μήτσος", lic: "ΙΑ-20088", spec: "Γενική Χειρουργική", rank: "Επιμελητής Β΄", deptId: 3, supervisorId: "d14", surgeries: 14 },
  { id: "d17", name: "Βασιλική Παπαδάκη", lic: "ΙΑ-21300", spec: "Γενική Χειρουργική", rank: "Ειδικευόμενος", deptId: 3, supervisorId: "d16", surgeries: 5 },
  { id: "d18", name: "Ιωάννης Σταματίου", lic: "ΙΑ-17004", spec: "Παιδιατρική", rank: "Επιμελητής Α΄", deptId: 4, supervisorId: "d04", surgeries: 0 },
  { id: "d19", name: "Ιωάννα Μάρκου", lic: "ΙΑ-09887", spec: "Επείγουσα Ιατρική", rank: "Διευθυντής", deptId: 8, supervisorId: null, surgeries: 0 },
  { id: "d20", name: "Πέτρος Κωνσταντινίδης", lic: "ΙΑ-20011", spec: "Επείγουσα Ιατρική", rank: "Επιμελητής Β΄", deptId: 8, supervisorId: "d19", surgeries: 0 },
];

const NURSES = [
  { id: "n01", name: "Άννα Παπαδάκη",     rank: "Προϊστάμενος",      deptId: 1 },
  { id: "n02", name: "Ελισάβετ Ζώη",      rank: "Νοσηλευτής",       deptId: 1 },
  { id: "n03", name: "Κατερίνα Λάππα",    rank: "Νοσηλευτής",       deptId: 1 },
  { id: "n04", name: "Μιχάλης Σπύρου",    rank: "Βοηθός Νοσηλευτή", deptId: 1 },
  { id: "n05", name: "Στέλλα Αναγνώστου", rank: "Προϊστάμενος",      deptId: 2 },
  { id: "n06", name: "Δέσποινα Καρά",     rank: "Νοσηλευτής",       deptId: 2 },
  { id: "n07", name: "Άρης Μανωλάκης",    rank: "Βοηθός Νοσηλευτή", deptId: 2 },
  { id: "n08", name: "Γιάννης Βερβέρης",  rank: "Νοσηλευτής",       deptId: 3 },
  { id: "n09", name: "Ναταλία Ιωσήφ",     rank: "Προϊστάμενος",      deptId: 3 },
  { id: "n10", name: "Φωτεινή Μπρα",     rank: "Νοσηλευτής",       deptId: 4 },
  { id: "n11", name: "Νίκη Ραπτάκη",     rank: "Νοσηλευτής",       deptId: 7 },
  { id: "n12", name: "Σπύρος Καμινάς",   rank: "Νοσηλευτής",       deptId: 7 },
  { id: "n13", name: "Ευτυχία Τόσκα",    rank: "Βοηθός Νοσηλευτή", deptId: 7 },
  { id: "n14", name: "Λεωνίδας Αθανασίου", rank: "Νοσηλευτής",     deptId: 8 },
  { id: "n15", name: "Ευγενία Μάνου",    rank: "Νοσηλευτής",       deptId: 8 },
];

const ADMIN = [
  { id: "a01", name: "Ευθυμία Λούκα",    role: "Γραμματέας",    office: "Κτ. Α, Γρ. 102", deptId: 1 },
  { id: "a02", name: "Παναγιώτης Ρώμας", role: "Λογιστής",       office: "Κτ. Δ, Γρ. 5",   deptId: null },
  { id: "a03", name: "Νάσος Δαμιανίδης", role: "Γραμματέας",    office: "Κτ. Α, Γρ. 201", deptId: 2 },
  { id: "a04", name: "Χρήστος Πιτσίκας", role: "Διοικητικός",    office: "Κτ. Δ, Γρ. 3",   deptId: null },
  { id: "a05", name: "Σταυρούλα Λυμπερά", role: "Γραμματέας",   office: "Κτ. Β, Γρ. 410", deptId: 3 },
];

const PATIENTS_TRIAGE = [
  { id: "p01", level: 1, name: "Δ. Ραπτόπουλος", symptoms: "Καρδιακή προσβολή, βαριά δύσπνοια", arrival: "07:42", waitMin: 2 },
  { id: "p02", level: 1, name: "Α. Μαλλίδου",    symptoms: "Τραύμα από τροχαίο, αιμορραγία",     arrival: "08:11", waitMin: 1 },
  { id: "p03", level: 2, name: "Κ. Βαρθαλίτης",   symptoms: "Έντονο θωρακικό άλγος",               arrival: "08:03", waitMin: 14 },
  { id: "p04", level: 2, name: "Μ. Σπυριδάκη",   symptoms: "Σοβαρή κρίση άσθματος",               arrival: "08:25", waitMin: 8 },
  { id: "p05", level: 2, name: "Γ. Παπαδάκης",   symptoms: "Επίμονος αιμορραγικός εμετός",       arrival: "08:38", waitMin: 4 },
  { id: "p06", level: 3, name: "Λ. Δερμιτζάκης",  symptoms: "Πυρετός 39.5°C, κεφαλαλγία",          arrival: "07:18", waitMin: 38 },
  { id: "p07", level: 3, name: "Ι. Τσιάμης",     symptoms: "Έμετος + διάρροια 24h",              arrival: "07:55", waitMin: 27 },
  { id: "p08", level: 3, name: "Ε. Ντόκα",       symptoms: "Πόνος κάτω κοιλίας",                  arrival: "08:32", waitMin: 18 },
  { id: "p09", level: 4, name: "Π. Σαβινίδης",   symptoms: "Διάστρεμμα αστραγάλου",              arrival: "07:01", waitMin: 64 },
  { id: "p10", level: 4, name: "Σ. Ιωαννίδου",   symptoms: "Πονόλαιμος, ωτίτιδα",                arrival: "07:44", waitMin: 41 },
  { id: "p11", level: 4, name: "Β. Καρρά",       symptoms: "Μικρό τραύμα παλάμης",                arrival: "08:20", waitMin: 22 },
  { id: "p12", level: 5, name: "Ο. Φουντούκη",   symptoms: "Συνταγογράφηση, τυπική επανεξέταση", arrival: "06:50", waitMin: 86 },
  { id: "p13", level: 5, name: "Φ. Νικολάου",    symptoms: "Ξανθό εξάνθημα ήπιο",                 arrival: "07:30", waitMin: 51 },
];

const PATIENTS = [
  { id: "P-1042", amka: "12048501231", first: "Δημήτριος", last: "Ραπτόπουλος", father: "Ηλίας", age: 62, gender: "Α", weight: 86, height: 174, address: "Πατησίων 122, Αθήνα", phone: "+30 6932 112 887", email: "d.raptopoulos@example.gr", job: "Συνταξιούχος", nationality: "Ελληνική", insurance: "ΕΦΚΑ", allergies: ["Πενικιλλίνη", "Ασπιρίνη"], contacts: [{ name: "Άννα Ραπτοπούλου (σύζυγος)", phone: "+30 6976 552 117"}, { name: "Νίκος Ραπτόπουλος (γιος)", phone: "+30 6944 213 905"}], hospitalizations: [
    { id: "H-22041", from: "2026-04-12", to: null, dept: "Καρδιολογική", icd10: "I21.4", ken: "F62B", bed: "Κ-12", cost: 4250, status: "ενεργή" },
    { id: "H-21878", from: "2025-11-22", to: "2025-11-29", dept: "Καρδιολογική", icd10: "I50.9", ken: "F62A", bed: "Κ-08", cost: 3120, status: "εξιτήριο" },
    { id: "H-20910", from: "2025-03-04", to: "2025-03-10", dept: "Παθολογική", icd10: "J18.9", ken: "E62A", bed: "Π-15", cost: 1980, status: "εξιτήριο" },
  ]},
  { id: "P-1099", amka: "29078801874", first: "Σοφία", last: "Καραμίντα", father: "Νικόλαος", age: 38, gender: "Γ", weight: 64, height: 168, address: "Βασ. Όλγας 8, Θεσσαλονίκη", phone: "+30 6948 553 002", email: "sofia.k@example.gr", job: "Δικηγόρος", nationality: "Ελληνική", insurance: "Ιδιωτική (ΕΘΝΙΚΗ)", allergies: [], contacts: [{ name: "Ιωάννης Καραμίντας", phone: "+30 6932 002 110"}], hospitalizations: [] },
  { id: "P-1110", amka: "08019301129", first: "Νικήτας", last: "Βαρθαλίτης", father: "Σπυρίδων", age: 33, gender: "Α", weight: 78, height: 181, address: "Σόλωνος 45, Αθήνα", phone: "+30 6977 887 002", email: "n.varth@example.gr", job: "Λογιστής", nationality: "Ελληνική", insurance: "ΕΦΚΑ", allergies: ["Ιωδιούχα σκιαγραφικά"], contacts: [], hospitalizations: [] },
];

const ICD10 = [
  { code: "I21.4", name: "Οξύ μη Q-έμφραγμα του μυοκαρδίου" },
  { code: "I50.9", name: "Καρδιακή ανεπάρκεια, μη καθορισμένη" },
  { code: "J18.9", name: "Πνευμονία, μη καθορισμένη" },
  { code: "K35.8", name: "Οξεία σκωληκοειδίτιδα, μη καθορισμένη" },
  { code: "E11.9", name: "Σακχαρώδης διαβήτης τύπου 2" },
  { code: "G40.9", name: "Επιληψία, μη καθορισμένη" },
  { code: "C50.9", name: "Κακόηθες νεόπλασμα μαστού" },
];

const KEN = [
  { code: "F62A", name: "Καρδιακή ανεπάρκεια & σοκ — βαρύ", base: 2840, mdn: 6 },
  { code: "F62B", name: "Καρδιακή ανεπάρκεια — μη βαρύ", base: 1980, mdn: 4 },
  { code: "E62A", name: "Λοιμώξεις αναπν. συστήματος", base: 1620, mdn: 5 },
  { code: "G07A", name: "Μείζονες επεμβ. λεπτού εντέρου", base: 5400, mdn: 8 },
];

const BEDS = [
  // Καρδιολογική
  { id: "Κ-01", dept: 1, type: "πολύκλινο", status: "κατειλημμένη", patient: "Α. Λαμπρίδης" },
  { id: "Κ-02", dept: 1, type: "πολύκλινο", status: "διαθέσιμη", patient: null },
  { id: "Κ-03", dept: 1, type: "μονόκλινο", status: "κατειλημμένη", patient: "Ε. Παπαϊωάννου" },
  { id: "Κ-04", dept: 1, type: "μονόκλινο", status: "υπό συντήρηση", patient: null },
  { id: "Κ-05", dept: 1, type: "πολύκλινο", status: "κατειλημμένη", patient: "Σ. Δημητρίου" },
  { id: "Κ-06", dept: 1, type: "πολύκλινο", status: "διαθέσιμη", patient: null },
  { id: "Κ-07", dept: 1, type: "πολύκλινο", status: "κατειλημμένη", patient: "Β. Νικολαΐδης" },
  { id: "Κ-08", dept: 1, type: "πολύκλινο", status: "διαθέσιμη", patient: null },
  { id: "Κ-09", dept: 1, type: "ΜΕΘ",        status: "κατειλημμένη", patient: "Μ. Σαββίδης" },
  { id: "Κ-10", dept: 1, type: "ΜΕΘ",        status: "κατειλημμένη", patient: "Π. Καρά" },
  { id: "Κ-11", dept: 1, type: "πολύκλινο", status: "διαθέσιμη", patient: null },
  { id: "Κ-12", dept: 1, type: "μονόκλινο", status: "κατειλημμένη", patient: "Δ. Ραπτόπουλος" },
];

const DRUGS = [
  { id: "DR01", name: "Augmentin 875mg",     substance: "Αμοξυκιλλίνη/κλαβουλανικό" },
  { id: "DR02", name: "Aspirin 100mg",       substance: "Ακετυλοσαλικυλικό οξύ" },
  { id: "DR03", name: "Salospir 81mg",       substance: "Ακετυλοσαλικυλικό οξύ" },
  { id: "DR04", name: "Concor 5mg",          substance: "Bisoprolol" },
  { id: "DR05", name: "Lipitor 20mg",        substance: "Ατορβαστατίνη" },
  { id: "DR06", name: "Metformin 850mg",     substance: "Μετφορμίνη" },
  { id: "DR07", name: "Penicillin V 500mg", substance: "Πενικιλλίνη" },
  { id: "DR08", name: "Depon 500mg",         substance: "Παρακεταμόλη" },
  { id: "DR09", name: "Plavix 75mg",         substance: "Κλοπιδογρέλη" },
];

const SURGERIES = [
  { id: "S01", room: "ΧΑ-1", name: "Στεφανιογραφία", category: "Α", surgeon: "d08", assistants: ["d09", "n01"], patient: "Δ. Ραπτόπουλος", start: 8, dur: 2 },
  { id: "S02", room: "ΧΑ-2", name: "Σκωληκοειδεκτομή", category: "Α", surgeon: "d14", assistants: ["d17", "n09"], patient: "Π. Σαβινίδης", start: 9, dur: 1.5 },
  { id: "S03", room: "ΧΑ-3", name: "Αρθροσκόπηση γόνατος", category: "Β", surgeon: "d15", assistants: ["d17"], patient: "Σ. Καραμίντα", start: 10.5, dur: 2 },
  { id: "S04", room: "ΧΑ-1", name: "Αγγειοπλαστική", category: "Α", surgeon: "d08", assistants: ["d10", "n02"], patient: "Β. Νικολαΐδης", start: 11.5, dur: 2.5 },
  { id: "S05", room: "ΧΑ-4", name: "Έκτακτη λαπαροτομή", category: "Α", surgeon: "d03", assistants: ["d14", "d16", "n09"], patient: "Α. Μαλλίδου", start: 8.5, dur: 3, urgent: true },
  { id: "S06", room: "ΧΑ-2", name: "Χολοκυστεκτομή", category: "Α", surgeon: "d16", assistants: ["d17", "n08"], patient: "Λ. Δερμιτζάκης", start: 13, dur: 2 },
  { id: "S07", room: "ΧΑ-3", name: "Αρθροπλαστική ισχίου", category: "Β", surgeon: "d15", assistants: ["d17", "n09"], patient: "Ο. Φουντούκη", start: 14, dur: 3 },
];

const REVIEWS = [
  { dept: "Καρδιολογική", avg: 4.6, n: 184 },
  { dept: "Παιδιατρική", avg: 4.5, n: 142 },
  { dept: "Νευρολογική", avg: 4.3, n: 96 },
  { dept: "Παθολογική", avg: 4.1, n: 211 },
  { dept: "Ογκολογική", avg: 4.0, n: 78 },
  { dept: "Χειρουργική", avg: 3.9, n: 165 },
  { dept: "Επείγοντα", avg: 3.6, n: 244 },
];

const QUERIES = [
  { id: "Q01", title: "Ασθενείς με ≥2 νοσηλείες στο ίδιο τμήμα τον τελευταίο χρόνο", parametric: false },
  { id: "Q02", title: "Top-3 τμήματα κατά μέσο βαθμό αξιολόγησης", parametric: false },
  { id: "Q03", title: "Γιατροί που έκαναν χειρουργικές & διαγνωστικές πράξεις τον ίδιο μήνα", parametric: false },
  { id: "Q04", title: "Μέσο κόστος νοσηλείας ανά τμήμα/εξάμηνο (+EXPLAIN, FORCE INDEX)", parametric: false, explainable: true },
  { id: "Q05", title: "Ασθενείς με ≥3 φάρμακα ίδια νοσηλεία & επικαλυπτόμενες περιόδους", parametric: false },
  { id: "Q06", title: "Τμήματα με αύξηση κόστους >20% YoY (+EXPLAIN, FORCE INDEX)", parametric: false, explainable: true },
  { id: "Q07", title: "Ανά δραστική ουσία: αλλεργικοί ασθενείς & φάρμακα που την περιέχουν", parametric: false },
  { id: "Q08", title: "Προσωπικό χωρίς εφημερία σε ημερομηνία/τμήμα", parametric: true, params: ["ημερομηνία", "τμήμα"] },
  { id: "Q09", title: "Ασθενείς με ίσες ημέρες νοσηλείας (>15 ημ.) σε έτος", parametric: false },
  { id: "Q10", title: "Top-3 ζευγάρια δραστικών ουσιών συν-συνταγογραφούμενα", parametric: false },
  { id: "Q11", title: "Γιατροί με ≥5 χειρουργεία λιγότερα από τον κορυφαίο", parametric: false },
  { id: "Q12", title: "Απαιτούμενο προσωπικό ανά τμήμα/βάρδια για εβδομάδα", parametric: true, params: ["εβδομάδα"] },
  { id: "Q13", title: "Πλήρης ιεραρχία επίβλεψης γιατρών (recursive CTE)", parametric: false },
  { id: "Q14", title: "Κατηγορίες ICD-10 με ίσες εισαγωγές δύο συνεχόμενες χρονιές", parametric: false },
  { id: "Q15", title: "Κατανομή triage ανά επίπεδο, με μ. αναμονή & εισαγωγές", parametric: false },
];

const mockUG = {
  DEPARTMENTS, DOCTORS, NURSES, ADMIN, PATIENTS_TRIAGE, PATIENTS,
  ICD10, KEN, BEDS, DRUGS, SURGERIES, REVIEWS, QUERIES,
};

window.UG = mockUG;
try {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/data', false);
  xhr.send(null);
  if (xhr.status === 200) {
    window.UG = JSON.parse(xhr.responseText);
  }
} catch (e) {
  console.error("Failed to fetch real data:", e);
}
window.DEPT_GREEK = {
  "Kardiologiko": "Καρδιολογικό",
  "Cheirourgiko": "Χειρουργικό",
  "Pathologiko": "Παθολογικό",
  "Orthopediko": "Ορθοπεδικό",
  "Neurologiko": "Νευρολογικό",
  "Paidiatriko": "Παιδιατρικό",
  "Gynaikologiko": "Γυναικολογικό",
  "Ogkologiko": "Ογκολογικό",
  "Ourologiko": "Ουρολογικό",
  "Pnevmonologiko": "Πνευμονολογικό",
  "Aimatologiko": "Αιματολογικό",
  "Revmatologiko": "Ρευματολογικό",
  "Nefrologiko": "Νεφρολογικό",
  "Dermatologiko": "Δερματολογικό",
  "Psychiatriko": "Ψυχιατρικό"
};

window.BED_TYPE_GREEK = {
  "μονόκλινο": "Μονόκλινο",
  "ΜΕΘ": "ΜΕΘ",
  "πολύκλινο": "Πολύκλινο"
};
