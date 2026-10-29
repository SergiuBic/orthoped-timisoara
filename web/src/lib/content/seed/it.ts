import type { SiteContent } from "../types";

export const it: SiteContent = {
  seo: {
    titleTemplate: "Ortopedico a {city} – {doctor} | Ortopedia e Traumatologia",
    description:
      "Ortopedico a {city}: lesioni del ginocchio (LCA, menisco, cartilagine), traumi sportivi e fratture. Visite in italiano, inglese e rumeno.",
    keywords: [
      "ortopedico {city}",
      "ortopedico a {city}",
      "medico ortopedico {city}",
      "ortopedico italiano in Romania",
      "ortopedico italiano a {city}",
      "rottura legamento crociato {city}",
      "ricostruzione LCA {city}",
      "artroscopia ginocchio {city}",
      "lesione del menisco {city}",
      "fratture e traumatologia {city}",
      "ortopedico italiano all'estero",
    ],
  },
  hero: {
    eyebrow: "Ortopedia e Traumatologia",
    h1: "Ortopedico a {city}",
    subtitle:
      "{doctor} si occupa di patologie del ginocchio, infortuni sportivi e fratture, con un piano chiaro e personalizzato. Visite in italiano, inglese e rumeno.",
    callCta: { label: "Chiama ora" },
    whatsappCta: { label: "WhatsApp" },
    mapsCta: { label: "Indicazioni" },
    highlights: ["Chirurgia artroscopica", "Infortuni sportivi", "Traumatologia", "IT · EN · RO"],
  },
  trust: {
    items: [
      { value: "MD, MSc, BScN", label: "Titoli medici e universitari" },
      { value: "ESSKA", label: "Società Europea di Traumatologia dello Sport, Chirurgia del Ginocchio e Artroscopia (membro – TODO-DOCTOR verificare)" },
      { value: "3", label: "Lingue parlate: italiano, inglese, rumeno" },
      { value: "TODO-DOCTOR", label: "Anni di esperienza clinica" },
    ],
  },
  kneeStory: {
    heading: "Il ginocchio, spiegato semplice",
    intro:
      "Il ginocchio è l'articolazione più complessa del corpo e una delle più sollecitate. Ecco le strutture più spesso colpite e quando conviene chiedere il parere di uno specialista.",
    steps: [
      {
        focus: "overview",
        title: "Un meccanismo complesso",
        text: "Il ginocchio unisce ossa, legamenti, menischi e cartilagine che lavorano insieme. Dolore persistente, gonfiore o la sensazione che il ginocchio ceda sono buoni motivi per una visita ortopedica.",
      },
      {
        focus: "acl",
        title: "Il legamento crociato anteriore (LCA)",
        text: "La rottura è frequente nel calcio, nello sci e nella pallamano, per un arresto brusco o una torsione. Segni tipici: uno schiocco al momento del trauma, gonfiore rapido e instabilità. Se il ginocchio “scappa”, prenoti una valutazione.",
      },
      {
        focus: "meniscus",
        title: "Il menisco",
        text: "I menischi ammortizzano e stabilizzano l'articolazione. Le lesioni nascono da torsioni o dall'usura e causano dolore interno o esterno, blocchi o scatti. Una valutazione precoce può aiutare a preservare più menisco possibile.",
      },
      {
        focus: "cartilage",
        title: "La cartilagine articolare",
        text: "La cartilagine riveste le ossa e permette il movimento senza attrito. Da sola guarisce con difficoltà. Dolore sotto sforzo, gonfiore ricorrente e sensazione di scricchiolio possono indicare un problema cartilagineo.",
      },
      {
        focus: "patella",
        title: "La rotula",
        text: "Il dolore nella parte anteriore del ginocchio, soprattutto sulle scale o dopo molto tempo da seduti, può dipendere dalla rotula. Lussazioni o instabilità rotulea richiedono una valutazione ortopedica.",
      },
    ],
  },
  traumaStory: {
    heading: "Le fratture: dal trauma alla guarigione",
    intro:
      "Una frattura è la rottura di un osso. La cura dipende dall'osso, dal tipo di frattura e dal paziente. Ecco le tappe, in parole semplici.",
    steps: [
      {
        focus: "intact",
        title: "L'osso sano",
        text: "L'osso è un tessuto vivo, che si rinnova di continuo e sa guarire. È su questa capacità che si basa ogni trattamento delle fratture.",
      },
      {
        focus: "fracture",
        title: "La frattura",
        text: "Dopo una caduta o un incidente, dolore forte, deformità, gonfiore o l'impossibilità di appoggiare l'arto possono indicare una frattura. Immobilizzi la zona e vada in pronto soccorso o chiami il 112.",
      },
      {
        focus: "reduction",
        title: "La riduzione",
        text: "Ridurre significa riportare i frammenti nella posizione corretta, a volte senza intervento, altre volte in sala operatoria. Radiografie e, se serve, TAC guidano la scelta.",
      },
      {
        focus: "fixation",
        title: "La fissazione",
        text: "Quando necessario, i frammenti vengono stabilizzati con placche, viti o chiodi affinché l'osso guarisca nella posizione giusta. Altre fratture si trattano senza chirurgia, con gesso o tutore.",
      },
      {
        focus: "healed",
        title: "Guarigione e riabilitazione",
        text: "L'osso si consolida in genere in alcune settimane o mesi, a seconda del caso. Controlli regolari e riabilitazione guidata aiutano a recuperare movimento e forza.",
      },
    ],
  },
  services: {
    heading: "Servizi di ortopedia e traumatologia",
    intro: "Patologie del ginocchio, infortuni sportivi e fratture, trattati con un piano personalizzato a {city}.",
    items: [
      {
        id: "acl-reconstruction",
        slug: "ricostruzione-lca",
        title: "Ricostruzione del legamento crociato anteriore (LCA)",
        summary: "Valutazione e trattamento della rottura del LCA, con opzioni conservative o chirurgiche adatte a età e attività.",
        icon: "Activity",
        seoTitle: "Ricostruzione LCA {city}",
        body: `## Che cos'è
Il legamento crociato anteriore (LCA) stabilizza il ginocchio nelle torsioni e negli arresti bruschi. La sua rottura è uno degli infortuni sportivi più comuni.

## Sintomi
- uno schiocco avvertito al momento del trauma;
- gonfiore rapido del ginocchio;
- sensazione di instabilità o di “cedimento”;
- difficoltà nei cambi di direzione e nei salti.

## Trattamento
La scelta dipende da età, livello di attività, instabilità percepita e lesioni associate (menisco, cartilagine). Alcuni pazienti stanno bene con riabilitazione e rinforzo muscolare. Per chi ha instabilità o pratica sport impegnativi può essere consigliata la ricostruzione del legamento, di solito in artroscopia, con un tendine prelevato dal paziente stesso. Il piano si definisce dopo visita, esame clinico e diagnostica per immagini.

## Recupero
Il recupero è graduale e richiede pazienza: controllo del gonfiore, recupero del movimento, rinforzo muscolare e poi lavoro specifico per lo sport. I tempi variano da persona a persona e il ritorno allo sport si decide in base alla funzione, non solo al calendario.

## Quando chiamare
Se dopo una torsione il ginocchio si è gonfiato, cede o non riesce ad appoggiarlo in sicurezza, prenoti una visita al più presto. TODO-DOCTOR`,
      },
      {
        id: "meniscus-surgery",
        slug: "chirurgia-menisco",
        title: "Chirurgia del menisco",
        summary: "Diagnosi e cura delle lesioni meniscali, puntando a conservare il più possibile il tessuto naturale.",
        icon: "Bone",
        seoTitle: "Lesione del menisco – cura a {city}",
        body: `## Che cos'è
I menischi sono due cuscinetti di fibrocartilagine nel ginocchio, che assorbono gli urti e stabilizzano l'articolazione. Possono lesionarsi per un trauma o per usura.

## Sintomi
- dolore sul lato interno o esterno del ginocchio;
- sensazione di blocco o di “inceppamento”;
- scatti durante il movimento;
- gonfiore dopo lo sforzo.

## Trattamento
Non tutte le lesioni meniscali richiedono un intervento. Quelle piccole, stabili o degenerative spesso migliorano con fisioterapia, modifica delle attività e, se serve, farmaci. Se i sintomi persistono o c'è blocco meccanico, può essere indicata l'artroscopia. Quando possibile si preferisce la sutura del menisco, per conservarlo; in altri casi si rimuove solo la parte danneggiata. La scelta dipende da tipo e sede della lesione, età e attività.

## Recupero
Dopo una sutura, carico e flessione sono di solito limitati per un periodo e poi aumentano gradualmente. Dopo una resezione parziale il recupero è in genere più rapido. Il programma esatto è individuale e si discute in visita.

## Quando chiamare
Se il ginocchio si blocca, non si estende del tutto o il dolore ritorna a ogni torsione, chieda una valutazione ortopedica. TODO-DOCTOR`,
      },
      {
        id: "knee-arthroscopy",
        slug: "artroscopia-ginocchio",
        title: "Artroscopia del ginocchio",
        summary: "Chirurgia mini-invasiva per diagnosticare e trattare i problemi interni dell'articolazione del ginocchio.",
        icon: "Microscope",
        seoTitle: "Artroscopia ginocchio {city}",
        body: `## Che cos'è
L'artroscopia è una tecnica mini-invasiva in cui il chirurgo introduce, attraverso piccole incisioni, una sottile telecamera e strumenti delicati nell'articolazione. Permette di vedere direttamente e di trattare molti problemi senza aprire ampiamente il ginocchio.

## Quando si utilizza
- lesioni del menisco;
- ricostruzione dei legamenti;
- problemi della cartilagine;
- corpi mobili intra-articolari;
- alcune patologie della rotula o della sinovia.

## Trattamento
L'intervento si svolge in sala operatoria, di solito in anestesia loco-regionale o generale, scelta insieme all'anestesista. Le incisioni sono di pochi millimetri. Rispetto alla chirurgia a cielo aperto, l'artroscopia comporta in genere meno dolore e un recupero più rapido, ma non tutte le patologie sono adatte. L'indicazione si pone dopo visita e diagnostica per immagini.

## Recupero
Molti pazienti iniziano presto a muovere il ginocchio con un programma di fisioterapia. I tempi dipendono da ciò che è stato trattato durante l'intervento.

## Quando chiamare
Se ha dolore al ginocchio che non migliora con le cure conservative o blocchi ripetuti, prenoti una visita per valutare se l'artroscopia è un'opzione. TODO-DOCTOR`,
      },
      {
        id: "sports-injuries",
        slug: "infortuni-sportivi",
        title: "Infortuni sportivi",
        summary: "Distorsioni, rotture legamentose, lesioni muscolo-tendinee e sovraccarichi in sportivi amatori e agonisti.",
        icon: "Dumbbell",
        seoTitle: "Infortuni sportivi – ortopedico a {city}",
        body: `## Che cosa sono
Gli infortuni sportivi comprendono distorsioni, rotture di legamenti e menisco, problemi tendinei, lussazioni e fratture da stress. Colpiscono sia gli agonisti sia chi si allena per passione.

## Sintomi
- dolore comparso durante o dopo l'attività;
- gonfiore, ematoma, limitazione del movimento;
- instabilità articolare;
- dolore che ritorna a ogni allenamento.

## Trattamento
Il primo passo è una diagnosi corretta con visita ed eventualmente radiografia, ecografia o risonanza. Molte lesioni si trattano in modo conservativo: riposo relativo, tutori, fisioterapia e ripresa graduale. Le lesioni che non guariscono da sole, come alcune rotture legamentose o meniscali, possono richiedere un intervento, spesso artroscopico. Il piano tiene conto dello sport praticato e dei suoi obiettivi.

## Recupero
Il ritorno allo sport avviene per tappe, con test funzionali e non solo in base al tempo trascorso. L'obiettivo non è solo riprendere, ma anche ridurre il rischio di un nuovo infortunio.

## Quando chiamare
Se il dolore dura più di qualche giorno o l'articolazione è instabile o gonfia, sospenda l'allenamento e prenoti una visita. TODO-DOCTOR`,
      },
      {
        id: "fracture-treatment",
        slug: "trattamento-fratture",
        title: "Trattamento delle fratture",
        summary: "Valutazione e cura delle fratture degli arti, conservativa o chirurgica, con riabilitazione guidata.",
        icon: "Bone",
        seoTitle: "Trattamento fratture {city}",
        body: `## Che cos'è
La frattura è la rottura parziale o completa di un osso, più spesso dopo una caduta, un incidente stradale o un infortunio sportivo. Può essere semplice o complessa, chiusa o esposta (quando l'osso fuoriesce dalla pelle).

## Sintomi
- dolore intenso e improvviso;
- gonfiore ed ematoma;
- deformità dell'arto;
- impossibilità di muovere o appoggiare la zona.

## Trattamento
La diagnosi si basa su visita e radiografia, talvolta con TAC. Le fratture stabili possono essere trattate con gesso, stecca o tutore. Quelle instabili, scomposte o che coinvolgono l'articolazione si trattano di solito chirurgicamente, con placche, viti o chiodi. La scelta dipende da osso, tipo di frattura, età e condizioni generali. Le fratture esposte sono un'emergenza.

## Recupero
L'osso guarisce in genere in settimane o mesi. Controlli radiografici e fisioterapia aiutano a recuperare movimento, forza e fiducia nell'arto.

## Quando chiamare
In caso di deformità evidente, osso visibile, forte sanguinamento o formicolio e perdita di sensibilità a mano o piede, chiami subito il 112. Per un sospetto di frattura senza questi segni, prenoti una visita al più presto. TODO-DOCTOR`,
      },
      {
        id: "cartilage-repair",
        slug: "riparazione-cartilagine",
        title: "Lesioni della cartilagine e artrosi iniziale",
        summary: "Valutazione del danno cartilagineo del ginocchio e opzioni di cura adatte allo stadio e all'età.",
        icon: "Layers",
        seoTitle: "Lesioni cartilagine ginocchio {city}",
        body: `## Che cos'è
La cartilagine articolare è lo strato liscio che riveste le estremità delle ossa e permette all'articolazione di scorrere. Può danneggiarsi per trauma, instabilità o usura, e la sua capacità di guarire da sola è limitata.

## Sintomi
- dolore sotto sforzo o sulle scale;
- gonfiore ricorrente;
- sensazione di scricchiolio o di blocco;
- rigidità al mattino.

## Trattamento
La cura dipende da dimensione e sede del danno, età, asse dell'arto e sintomi. Molti pazienti traggono beneficio da misure conservative: fisioterapia, controllo del peso, modifica delle attività e farmaci. In casi selezionati, soprattutto nei pazienti più giovani con lesioni localizzate, si possono valutare tecniche chirurgiche per stimolare o riparare la cartilagine. Non esiste una soluzione unica e i risultati non si possono garantire; le opzioni si discutono in modo realistico dopo la valutazione e gli esami.

## Recupero
Il recupero è di solito graduale, con protezione iniziale dell'articolazione e aumento progressivo del carico. I tempi dipendono dalla tecnica utilizzata.

## Quando chiamare
Se il dolore al ginocchio limita da settimane la vita quotidiana o lo sport, prenoti una valutazione. TODO-DOCTOR`,
      },
    ],
  },
  about: {
    heading: "Chi è {doctor}",
    body: `{doctor} è un ortopedico di formazione italiana che esercita a {city}. Si occupa soprattutto di chirurgia e patologie del ginocchio (legamenti, menisco, cartilagine, rotula), infortuni sportivi e traumatologia.

Con i titoli **MD, MSc, BScN**, segue un approccio basato sulle evidenze e svolge attività di ricerca, visibile nel profilo ResearchGate. È legato alla comunità **ESSKA** (Società Europea di Traumatologia dello Sport, Chirurgia del Ginocchio e Artroscopia) – TODO-DOCTOR verificare l'iscrizione.

Durante la visita, {doctor} spiega in modo semplice che cosa sta succedendo, quali sono le opzioni e che cosa è realistico aspettarsi, senza false promesse. Le visite si svolgono in italiano, inglese o rumeno.

TODO-DOCTOR: aggiungere il percorso professionale (università, ospedali, formazione, anni di esperienza).`,
    credentials: ["MD – Laurea in Medicina", "MSc", "BScN", "Membro ESSKA – TODO-DOCTOR verificare", "Ricerca clinica – ResearchGate"],
    languages: ["Italiano", "English", "Română"],
  },
  process: {
    heading: "Come funziona",
    steps: [
      { title: "Chiami o scriva", text: "Telefono, WhatsApp o modulo di richiamo. Fissiamo insieme il primo appuntamento.", icon: "Phone" },
      { title: "Prima visita e imaging", text: "Colloquio, esame clinico e, se serve, radiografia, ecografia o risonanza.", icon: "Stethoscope" },
      { title: "Piano personalizzato", text: "Le opzioni, conservative o chirurgiche, spiegate con vantaggi e rischi.", icon: "ClipboardList" },
      { title: "Recupero e controlli", text: "Riabilitazione guidata e controlli periodici fino al ritorno alle sue attività.", icon: "HeartPulse" },
    ],
  },
  faq: {
    heading: "Domande frequenti",
    items: [
      { q: "Serve l'impegnativa per la visita?", a: "Per una visita privata di norma non è necessaria l'impegnativa. Per informazioni su rimborsi o prestazioni nel sistema pubblico, chieda al momento della prenotazione. TODO-DOCTOR" },
      { q: "Che cosa devo portare alla prima visita?", a: "La documentazione medica precedente (referti di risonanza, radiografie, lettere mediche), l'elenco dei farmaci e, se li ha, il CD o i file delle immagini. Indossi abiti che permettano di esaminare facilmente il ginocchio o la zona interessata." },
      { q: "Quanto dura il recupero dopo la rottura del LCA?", a: "Varia da caso a caso. Le attività quotidiane riprendono di solito prima, mentre per gli sport con rotazioni servono in genere diversi mesi di riabilitazione guidata. I tempi esatti si definiscono individualmente." },
      { q: "Artroscopia o chirurgia a cielo aperto?", a: "L'artroscopia è mini-invasiva e di solito permette un recupero più rapido, ma non è adatta a ogni patologia. La scelta dipende dalla lesione e si discute dopo visita ed esami." },
      { q: "Quando posso tornare a fare sport?", a: "Dipende dalla lesione e dal trattamento. Il ritorno si decide in base a forza, stabilità e test funzionali, non solo al tempo trascorso dall'infortunio o dall'intervento." },
      { q: "Che cosa devo fare in caso di emergenza?", a: "Se dopo un trauma c'è una deformità evidente, osso visibile, forte sanguinamento, perdita di sensibilità o dolore insopportabile, chiami subito il 112 o vada al pronto soccorso più vicino." },
      { q: "In quali lingue si svolgono le visite?", a: "In italiano, inglese e rumeno." },
      { q: "Dove si trova lo studio a {city}?", a: "Lo studio si trova a {city}. L'indirizzo esatto e il pulsante delle indicazioni sono nella sezione contatti. TODO-DOCTOR verificare l'indirizzo." },
    ],
  },
  contact: {
    heading: "Prenotazioni e contatti",
    text: "Chiami, scriva su WhatsApp o lasci il suo numero: la ricontatteremo per fissare una visita a {city}.",
    formTitle: "Richieda di essere richiamato",
    emergencyNote: "Emergenza medica? Chiami il 112.",
  },
  legal: {
    medicalDisclaimer:
      "Le informazioni di questo sito sono generali e a scopo educativo e non sostituiscono la visita medica, la diagnosi o il trattamento. L'assistente virtuale non fa diagnosi. In caso di emergenza, chiami il 112.",
    privacyBody: `# Informativa sulla privacy

## Titolare del trattamento
Il titolare del trattamento dei dati personali è {doctor}. TODO-DOCTOR: inserire denominazione legale, indirizzo e contatti.

## Quali dati raccogliamo
- **Modulo di richiamo:** nome, numero di telefono ed eventualmente il messaggio.
- **Assistente virtuale:** il contenuto delle conversazioni, conservato per **30 giorni** e poi cancellato automaticamente. Non inserisca dati sanitari sensibili nella chat.
- **Statistiche anonime:** visite e clic sui pulsanti di contatto, senza cookie e senza identificarla personalmente. Usiamo un identificativo anonimo che cambia ogni giorno.

## Base giuridica e finalità
I dati del modulo sono trattati per contattarla e fissare un appuntamento (art. 6, par. 1, lett. b e a GDPR – misure precontrattuali e consenso). Le statistiche anonime e le chat con l'assistente servono a gestire e migliorare il sito (legittimo interesse, art. 6, par. 1, lett. f GDPR).

## Conservazione
Richieste di richiamo – TODO-DOCTOR periodo. Conversazioni – 30 giorni. Eventi statistici – 13 mesi.

## I suoi diritti
Ha diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità, e il diritto di proporre reclamo all'autorità rumena per la protezione dei dati (ANSPDCP) o al Garante italiano.

## Contatti
Per qualsiasi richiesta sui suoi dati usi i contatti indicati nel sito. TODO-DOCTOR`,
  },
};
