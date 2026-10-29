import type { SiteContent } from "../types";

export const ro: SiteContent = {
  seo: {
    titleTemplate: "Ortoped {city} – {doctor} | Ortopedie și Traumatologie",
    description:
      "Ortoped în {city}: leziuni de genunchi (LCA, menisc, cartilaj), traumatisme sportive și fracturi. Consultații în română, italiană și engleză.",
    keywords: [
      "ortoped {city}",
      "medic ortoped {city}",
      "doctor ortoped {city}",
      "ruptură LCA {city}",
      "reconstrucție ligament încrucișat anterior {city}",
      "artroscopie genunchi {city}",
      "leziune menisc {city}",
      "fractură {city}",
      "traumatologie {city}",
      "ortoped italian {city}",
      "chirurgie genunchi",
    ],
  },
  hero: {
    eyebrow: "Ortopedie și Traumatologie",
    h1: "Ortoped {city}",
    subtitle:
      "{doctor} tratează afecțiunile genunchiului, leziunile sportive și fracturile, cu un plan clar și personalizat. Consultații în română, italiană și engleză.",
    callCta: { label: "Sună acum" },
    whatsappCta: { label: "WhatsApp" },
    mapsCta: { label: "Direcții" },
    highlights: ["Chirurgie artroscopică", "Leziuni sportive", "Traumatologie", "RO · IT · EN"],
  },
  trust: {
    items: [
      { value: "MD, MSc, BScN", label: "Calificări medicale și universitare" },
      { value: "ESSKA", label: "Societatea Europeană de Traumatologie Sportivă, Chirurgia Genunchiului și Artroscopie (membru – TODO-DOCTOR verificați)" },
      { value: "3", label: "Limbi vorbite: română, italiană, engleză" },
      { value: "TODO-DOCTOR", label: "Ani de experiență clinică" },
    ],
  },
  kneeStory: {
    heading: "Genunchiul, pe înțelesul tuturor",
    intro:
      "Genunchiul este cea mai complexă articulație a corpului și printre cele mai solicitate. Iată structurile care sunt afectate cel mai des și când merită să cereți o părere de specialitate.",
    steps: [
      {
        focus: "overview",
        title: "Un mecanism complex",
        text: "Genunchiul reunește oase, ligamente, menisci și cartilaj care lucrează împreună. O durere persistentă, o umflătură sau senzația că genunchiul „cedează” sunt motive bune pentru un consult ortopedic.",
      },
      {
        focus: "acl",
        title: "Ligamentul încrucișat anterior (LCA)",
        text: "Se rupe frecvent la fotbal, schi sau handbal, prin oprire bruscă sau rotire. Simptome tipice: pocnet în momentul accidentului, umflare rapidă și instabilitate. Dacă genunchiul „fuge”, programați o evaluare.",
      },
      {
        focus: "meniscus",
        title: "Meniscul",
        text: "Meniscurile amortizează și stabilizează articulația. Leziunile apar la răsuciri sau prin uzură și dau durere pe interiorul sau exteriorul genunchiului, blocaje sau senzație de pocnet. Evaluarea precoce poate păstra mai mult din menisc.",
      },
      {
        focus: "cartilage",
        title: "Cartilajul articular",
        text: "Cartilajul acoperă oasele și permite mișcarea fără frecare. Nu se vindecă ușor singur. Durerea la efort, umflarea repetată și senzația de scrâșnet pot indica o suferință a cartilajului.",
      },
      {
        focus: "patella",
        title: "Rotula",
        text: "Durerea din fața genunchiului, mai ales la urcat scările sau după ședere prelungită, poate veni de la rotulă. Luxațiile sau instabilitatea rotuliană necesită evaluare ortopedică.",
      },
    ],
  },
  traumaStory: {
    heading: "Fracturile: de la accident la vindecare",
    intro:
      "O fractură înseamnă ruptura osului. Tratamentul depinde de os, de tipul fracturii și de pacient. Iată etapele, explicate simplu.",
    steps: [
      {
        focus: "intact",
        title: "Osul sănătos",
        text: "Osul este un țesut viu, care se reînnoiește continuu și are capacitatea de a se vindeca. Aceasta este baza oricărui tratament al fracturilor.",
      },
      {
        focus: "fracture",
        title: "Fractura",
        text: "După o cădere sau un accident, durerea intensă, deformarea, umflarea sau imposibilitatea de a sprijini membrul pot semnala o fractură. Imobilizați zona și mergeți la urgențe sau sunați la 112.",
      },
      {
        focus: "reduction",
        title: "Reducerea",
        text: "Reducerea înseamnă readucerea fragmentelor în poziția corectă, uneori fără operație, alteori în timpul unei intervenții chirurgicale. Radiografia și, la nevoie, CT-ul ghidează decizia.",
      },
      {
        focus: "fixation",
        title: "Fixarea",
        text: "Dacă este necesar, fragmentele sunt stabilizate cu plăci, șuruburi sau tije, ca osul să se vindece în poziția corectă. Alte fracturi se tratează conservator, cu ghips sau orteză.",
      },
      {
        focus: "healed",
        title: "Vindecarea și recuperarea",
        text: "Osul se consolidează de obicei în câteva săptămâni până la luni, în funcție de caz. Controalele periodice și recuperarea ghidată ajută la revenirea mobilității și a forței.",
      },
    ],
  },
  services: {
    heading: "Servicii de ortopedie și traumatologie",
    intro: "Afecțiuni ale genunchiului, leziuni sportive și fracturi, tratate cu un plan personalizat la {city}.",
    items: [
      {
        id: "acl-reconstruction",
        slug: "reconstructie-lca",
        title: "Reconstrucție de ligament încrucișat anterior (LCA)",
        summary: "Evaluare și tratament al rupturii de LCA, cu opțiuni conservatoare sau chirurgicale adaptate vârstei și activității.",
        icon: "Activity",
        seoTitle: "Reconstrucție LCA {city}",
        body: `## Ce este
Ligamentul încrucișat anterior (LCA) stabilizează genunchiul la răsucire și la oprire bruscă. Ruptura lui este una dintre cele mai frecvente leziuni sportive.

## Simptome
- pocnet resimțit în momentul accidentului;
- umflare rapidă a genunchiului;
- senzație de instabilitate sau de „cedare”;
- dificultate la schimbări de direcție și la sărituri.

## Tratament
Decizia depinde de vârstă, nivelul de activitate, instabilitatea resimțită și leziunile asociate (menisc, cartilaj). Unii pacienți se descurcă bine cu recuperare funcțională și întărire musculară. Pentru cei cu instabilitate sau cu cerințe sportive ridicate se poate recomanda reconstrucția ligamentului, de regulă artroscopică, cu un grefon din țesuturile pacientului. Planul se stabilește după consult, examen clinic și investigații imagistice.

## Recuperare
Recuperarea este graduală și cere răbdare: control al edemului, recâștigarea mobilității, întărire musculară și apoi exerciții specifice sportului. Durata variază de la un pacient la altul, iar revenirea la sport se decide pe criterii funcționale, nu doar pe calendar.

## Când să sunați
Dacă după o răsucire genunchiul s-a umflat, cedează sau nu îl mai puteți sprijini în siguranță, programați o consultație cât mai curând. TODO-DOCTOR`,
      },
      {
        id: "meniscus-surgery",
        slug: "chirurgie-menisc",
        title: "Chirurgia meniscului",
        summary: "Diagnostic și tratament al leziunilor de menisc, cu accent pe păstrarea cât mai multă a țesutului propriu.",
        icon: "Bone",
        seoTitle: "Leziune menisc – tratament {city}",
        body: `## Ce este
Meniscurile sunt două discuri de fibrocartilaj din genunchi, care amortizează șocurile și stabilizează articulația. Pot fi lezate prin traumatism sau prin uzură.

## Simptome
- durere pe interiorul sau pe exteriorul genunchiului;
- senzația de blocaj sau de „agățare”;
- pocnete la mișcare;
- umflare după efort.

## Tratament
Nu orice leziune de menisc necesită operație. Leziunile mici, stabile sau degenerative se pot ameliora cu kinetoterapie, modificarea activităților și, la nevoie, medicație. Când simptomele persistă sau există blocaj mecanic, se poate indica o intervenție artroscopică. Ori de câte ori este posibil, se preferă sutura meniscului, pentru a-l păstra; în alte situații se îndepărtează doar partea lezată. Alegerea depinde de tipul și de localizarea leziunii, de vârstă și de activitate.

## Recuperare
După sutură, încărcarea și flexia sunt de obicei limitate o perioadă, apoi progresează treptat. După rezecție parțială, revenirea este în general mai rapidă. Programul exact este individual și se discută la consult.

## Când să sunați
Dacă genunchiul se blochează, nu se mai poate îndrepta complet sau durerea revine la fiecare răsucire, cereți o evaluare ortopedică. TODO-DOCTOR`,
      },
      {
        id: "knee-arthroscopy",
        slug: "artroscopie-genunchi",
        title: "Artroscopie de genunchi",
        summary: "Intervenție minim invazivă pentru diagnosticul și tratamentul problemelor intra-articulare ale genunchiului.",
        icon: "Microscope",
        seoTitle: "Artroscopie genunchi {city}",
        body: `## Ce este
Artroscopia este o tehnică minim invazivă în care chirurgul introduce printr-o incizie mică o cameră video subțire și instrumente fine în articulație. Permite vizualizarea directă și tratarea multor leziuni fără a deschide larg genunchiul.

## Când se folosește
- leziuni de menisc;
- reconstrucția ligamentelor;
- probleme de cartilaj;
- corpi liberi intra-articulari;
- unele afecțiuni ale rotulei sau ale sinovialei.

## Tratament
Intervenția se face în sală de operație, de obicei cu anestezie regională sau generală, stabilită împreună cu medicul anestezist. Incizile sunt mici, de câțiva milimetri. Comparativ cu chirurgia clasică, artroscopia are de regulă durere postoperatorie mai mică și o recuperare mai rapidă, dar nu toate afecțiunile se pretează la această tehnică. Indicația se pune după examen clinic și imagistică.

## Recuperare
Mulți pacienți încep să mobilizeze genunchiul rapid, cu ajutorul unui program de kinetoterapie. Ritmul depinde de ce s-a tratat în timpul intervenției.

## Când să sunați
Dacă aveți dureri de genunchi care nu se ameliorează cu tratament conservator sau blocaje repetate, programați o consultație pentru a discuta dacă artroscopia este o opțiune. TODO-DOCTOR`,
      },
      {
        id: "sports-injuries",
        slug: "leziuni-sportive",
        title: "Leziuni sportive",
        summary: "Entorse, rupturi ligamentare, leziuni musculo-tendinoase și suprasolicitări la sportivi amatori și de performanță.",
        icon: "Dumbbell",
        seoTitle: "Leziuni sportive – ortoped {city}",
        body: `## Ce sunt
Leziunile sportive includ entorse, rupturi de ligamente și menisc, afecțiuni ale tendoanelor, luxații și fracturi de stres. Apar atât la sportivii de performanță, cât și la cei care fac mișcare pentru plăcere.

## Simptome
- durere apărută în timpul sau după efort;
- umflare, vânătaie, limitarea mișcării;
- instabilitate articulară;
- durere care revine la fiecare antrenament.

## Tratament
Primul pas este un diagnostic corect, prin examen clinic și, la nevoie, radiografie, ecografie sau RMN. Multe leziuni se tratează conservator: repaus relativ, orteze, kinetoterapie și revenire progresivă. Leziunile care nu se vindecă singure, cum sunt unele rupturi ligamentare sau meniscale, pot necesita tratament chirurgical, de multe ori artroscopic. Planul ține cont de sportul practicat și de obiectivele dumneavoastră.

## Recuperare
Revenirea la sport se face în etape, cu teste funcționale, nu doar pe baza trecerii timpului. Scopul este nu doar să reveniți, ci să reduceți riscul unei noi leziuni.

## Când să sunați
Dacă durerea persistă mai mult de câteva zile, dacă articulația este instabilă sau umflată, nu continuați antrenamentul și programați o consultație. TODO-DOCTOR`,
      },
      {
        id: "fracture-treatment",
        slug: "tratament-fracturi",
        title: "Tratamentul fracturilor",
        summary: "Evaluare și tratament al fracturilor membrelor, conservator sau chirurgical, cu recuperare ghidată.",
        icon: "Bone",
        seoTitle: "Tratament fracturi {city}",
        body: `## Ce este
O fractură este ruptura parțială sau completă a unui os, cel mai des după cădere, accident rutier sau sportiv. Poate fi simplă sau complexă, închisă sau deschisă (când osul a străpuns pielea).

## Simptome
- durere intensă și bruscă;
- umflare și vânătaie;
- deformare a membrului;
- imposibilitatea de a mișca sau de a sprijini zona.

## Tratament
Diagnosticul se pune prin examen clinic și radiografie, uneori completat cu CT. Fracturile stabile se pot trata conservator, cu ghips, atelă sau orteză. Cele instabile, deplasate sau care implică articulația se tratează de obicei chirurgical, prin osteosinteză cu plăci, șuruburi sau tije. Alegerea depinde de os, de tipul fracturii, de vârstă și de starea generală. Fracturile deschise sunt urgențe.

## Recuperare
Osul se consolidează în săptămâni până la luni. Controalele radiologice și kinetoterapia ajută la recâștigarea mobilității, a forței și a încrederii în membrul afectat.

## Când să sunați
În caz de deformare evidentă, os vizibil, sângerare importantă sau amorțeală a mâinii ori a piciorului, sunați imediat la 112. Pentru o suspiciune de fractură fără aceste semne, programați o consultație cât mai repede. TODO-DOCTOR`,
      },
      {
        id: "cartilage-repair",
        slug: "reparare-cartilaj",
        title: "Leziuni de cartilaj și artroză incipientă",
        summary: "Evaluarea leziunilor de cartilaj ale genunchiului și opțiuni de tratament adaptate stadiului și vârstei.",
        icon: "Layers",
        seoTitle: "Leziuni cartilaj genunchi {city}",
        body: `## Ce este
Cartilajul articular este stratul neted care acoperă capetele oaselor și permite mișcarea fără frecare. Poate fi lezat prin traumatism, instabilitate sau uzură, iar capacitatea lui de vindecare spontană este limitată.

## Simptome
- durere la efort sau la urcatul scărilor;
- umflare repetată;
- senzație de scrâșnet sau de blocaj;
- rigiditate matinală.

## Tratament
Tratamentul depinde de mărimea și localizarea leziunii, de vârstă, de axul membrului și de simptome. Mulți pacienți beneficiază de măsuri conservatoare: kinetoterapie, controlul greutății, modificarea activităților și medicație. În cazuri selectate, în special la pacienții mai tineri cu leziuni localizate, se pot lua în calcul tehnici chirurgicale de stimulare sau de reparare a cartilajului. Nu există o soluție unică și rezultatele nu pot fi promise; opțiunile se discută realist, după evaluare și imagistică.

## Recuperare
Recuperarea este de obicei graduală, cu protejarea articulației la început și creșterea progresivă a încărcării. Ritmul depinde de tehnica folosită.

## Când să sunați
Dacă durerea de genunchi vă limitează activitățile zilnice sau sportul de mai multe săptămâni, programați o evaluare. TODO-DOCTOR`,
      },
    ],
  },
  about: {
    heading: "Despre {doctor}",
    body: `{doctor} este medic ortoped format în Italia, cu activitate în {city}. Se ocupă în principal de chirurgia și patologia genunchiului (ligamente, menisc, cartilaj, rotulă), de leziunile sportive și de traumatologie.

Are titlurile **MD, MSc, BScN** și este interesat de medicina bazată pe dovezi, participând la activitate de cercetare, vizibilă pe profilul ResearchGate. Este asociat cu comunitatea **ESSKA** (Societatea Europeană de Traumatologie Sportivă, Chirurgia Genunchiului și Artroscopie) – TODO-DOCTOR verificați calitatea de membru.

În consultații, {doctor} explică pe înțelesul pacientului ce se întâmplă, ce opțiuni există și ce poate aștepta realist, fără promisiuni exagerate. Discuția poate avea loc în română, italiană sau engleză.

TODO-DOCTOR: completați parcursul profesional (universități, spitale, stagii de formare, ani de experiență).`,
    credentials: ["MD – Doctor în medicină", "MSc", "BScN", "Membru ESSKA – TODO-DOCTOR verificați", "Cercetare clinică – ResearchGate"],
    languages: ["Română", "Italiano", "English"],
  },
  process: {
    heading: "Cum decurge tratamentul",
    steps: [
      { title: "Sunați sau scrieți", text: "Telefon, WhatsApp sau formularul de apel înapoi. Stabilim împreună prima întâlnire.", icon: "Phone" },
      { title: "Prima consultație și imagistică", text: "Discuție, examen clinic și, la nevoie, radiografie, ecografie sau RMN.", icon: "Stethoscope" },
      { title: "Plan personalizat", text: "Vi se explică opțiunile, conservatoare sau chirurgicale, cu avantaje și riscuri.", icon: "ClipboardList" },
      { title: "Recuperare și control", text: "Program de recuperare ghidat și controale periodice până la revenirea la activitate.", icon: "HeartPulse" },
    ],
  },
  faq: {
    heading: "Întrebări frecvente",
    items: [
      { q: "Am nevoie de bilet de trimitere pentru consultație?", a: "Pentru o consultație privată, de regulă nu este necesar un bilet de trimitere. Pentru detalii despre decontare sau servicii prin sistemul public, întrebați la programare. TODO-DOCTOR" },
      { q: "Ce trebuie să aduc la prima consultație?", a: "Documentele medicale anterioare (rezultate de RMN, radiografii, scrisori medicale), lista medicamentelor folosite și, dacă aveți, discul sau fișierele imagistice. Purtați haine în care genunchiul sau zona afectată să poată fi examinate ușor." },
      { q: "Cât durează recuperarea după o ruptură de LCA?", a: "Variază de la caz la caz. Revenirea la activitățile zilnice este de obicei mai rapidă, iar întoarcerea la sporturi cu pivotare cere, în general, mai multe luni de recuperare ghidată. Calendarul exact se stabilește individual." },
      { q: "Artroscopie sau chirurgie clasică?", a: "Artroscopia este minim invazivă și are de obicei o recuperare mai rapidă, dar nu este potrivită pentru toate afecțiunile. Alegerea depinde de leziune și se discută după examinare și imagistică." },
      { q: "Când pot reveni la sport?", a: "Depinde de leziune și de tratament. Revenirea se decide pe baza forței, a stabilității și a testelor funcționale, nu doar a timpului scurs de la accident sau operație." },
      { q: "Ce fac în caz de urgență?", a: "Dacă aveți o deformare evidentă, os vizibil, sângerare importantă, amorțeală sau durere insuportabilă după un traumatism, sunați imediat la 112 sau mergeți la cea mai apropiată unitate de primiri urgențe." },
      { q: "În ce limbi se pot face consultațiile?", a: "În română, italiană și engleză." },
      { q: "Unde se află cabinetul din {city}?", a: "Cabinetul este situat în {city}. Adresa exactă și butonul de direcții sunt în secțiunea de contact. TODO-DOCTOR verificați adresa." },
    ],
  },
  contact: {
    heading: "Programări și contact",
    text: "Sunați, scrieți pe WhatsApp sau lăsați-vă numărul și vă contactăm noi pentru o programare în {city}.",
    formTitle: "Solicitați un apel înapoi",
    emergencyNote: "Urgență medicală? Sunați la 112.",
  },
  legal: {
    medicalDisclaimer:
      "Informațiile de pe acest site au caracter general și educativ și nu înlocuiesc consultul medical, diagnosticul sau tratamentul. Asistentul virtual nu pune diagnostice. În caz de urgență, sunați la 112.",
    privacyBody: `# Politica de confidențialitate

## Operatorul de date
Operatorul datelor cu caracter personal este {doctor}. TODO-DOCTOR: completați denumirea legală, adresa și datele de contact.

## Ce date colectăm
- **Formularul de apel înapoi:** numele, numărul de telefon și, opțional, mesajul dumneavoastră.
- **Asistentul virtual:** conținutul conversațiilor, păstrat **30 de zile**, apoi șters automat. Nu introduceți date medicale sensibile în chat.
- **Statistici anonime:** vizite și clickuri pe butoanele de contact, fără cookie-uri și fără a vă identifica personal. Folosim un identificator anonim, care se schimbă zilnic.

## Temeiul legal și scopul
Datele din formular sunt prelucrate pentru a vă contacta și a stabili o programare (art. 6 alin. 1 lit. b și a GDPR – măsuri precontractuale și consimțământ). Statisticile anonime și conversațiile cu asistentul servesc la funcționarea și îmbunătățirea site-ului (interes legitim, art. 6 alin. 1 lit. f GDPR).

## Cât păstrăm datele
Cererile de apel înapoi – TODO-DOCTOR perioada. Conversațiile – 30 de zile. Evenimentele statistice – 13 luni.

## Drepturile dumneavoastră
Aveți dreptul de acces, rectificare, ștergere, restricționare, opoziție și portabilitate, precum și dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).

## Contact
Pentru orice solicitare privind datele dumneavoastră, folosiți datele de contact din pagină. TODO-DOCTOR`,
  },
};
