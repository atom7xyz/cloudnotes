import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import cloudsBackground from "../../assets/clouds3.jpg";
import { PrinterIcon, ArrowLeftIcon } from "lucide-react";
import PrintModal from "../modals/PrintModal";
import { AppLink } from "@/components/ui/app-link";

// Section type definition
interface TosSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function Tos() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const lastUpdated = "10 Maggio 2024";
  
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      
      // Clear any existing highlights first
      for (const ref of Object.values(sectionRefs.current)) {
        if (ref) {
          ref.classList.remove("bg-primary/[0.06]");
        }
      }
      
      // Set new active section and highlight
      setActiveSection(sectionId);
      section.classList.add("bg-primary/[0.06]");
      
      // Clear highlight and active section after 2 seconds
      setTimeout(() => {
        if (section) {
          section.classList.remove("bg-primary/[0.06]");
          setActiveSection("");
        }
      }, 2000);
    }
  };
  
  const sections: TosSection[] = [
    {
      id: "legal-terms",
      title: "Accordo sui Nostri Termini Legali",
      content: (
        <div className="space-y-4">
          <p>
            Siamo CloudNotes LLC ("Società," "noi," "nostro"), una società registrata in Italia presso Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125.
          </p>
          <p>
            Gestiamo il sito web <strong>cloudnotes.com</strong> (il "Sito"), così come qualsiasi altro prodotto e servizio correlato che fa riferimento o si collega a questi termini legali (i "Termini Legali") (collettivamente, i "Servizi").
          </p>
          <p>
            Questa applicazione mira ad aiutare studenti di tutte le età a trovare i propri metodi di studio utilizzando vari strumenti tecnologici integrati.
          </p>
          <p>
            Puoi contattarci per telefono al <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>, via email a <AppLink href="mailto:contact@cloudnotes.com" external>contact@cloudnotes.com</AppLink>, o per posta a Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125, Italia.
          </p>
          <p>
            Questi Termini Legali costituiscono un accordo legalmente vincolante stipulato tra te, personalmente o per conto di un'entità ("tu"), e CloudNotes LLC, riguardo al tuo accesso e utilizzo dei Servizi. Accetti che accedendo ai Servizi, hai letto, compreso e accettato di essere vincolato da tutti questi Termini Legali.{" "}
            <strong>
              SE NON ACCETTI TUTTI QUESTI TERMINI LEGALI, ALLORA TI È ESPRESSAMENTE VIETATO UTILIZZARE I SERVIZI E DEVI INTERROMPERE IMMEDIATAMENTE L'UTILIZZO.
            </strong>
          </p>
          <p>
            Termini e condizioni supplementari o documenti che possono essere pubblicati sui Servizi di volta in volta sono qui esplicitamente incorporati per riferimento. Ci riserviamo il diritto, a nostra esclusiva discrezione, di apportare modifiche o modificazioni a questi Termini Legali di volta in volta. Ti avviseremo di eventuali modifiche aggiornando la data "Ultimo aggiornamento", e rinunci a qualsiasi diritto di ricevere un avviso specifico di ogni tale modifica. È tua responsabilità rivedere periodicamente questi Termini Legali per rimanere informato degli aggiornamenti. Il tuo uso continuato dei Servizi dopo la pubblicazione di tali modifiche significherà la tua accettazione dei Termini Legali rivisti.
          </p>
          <p>
            Tutti gli utenti che sono minori nella giurisdizione in cui risiedono (generalmente sotto i 18 anni) devono avere il permesso di, ed essere direttamente supervisionati da, un genitore o tutore per utilizzare i Servizi. Se sei minorenne, devi far leggere e accettare questi Termini Legali al tuo genitore o tutore prima di utilizzare i Servizi.
          </p>
          <p>Ti consigliamo di stampare una copia di questi Termini Legali per i tuoi archivi.</p>
        </div>
      ),
    },
    {
      id: "our-services",
      title: "I Nostri Servizi",
      content: (
        <div className="space-y-4">
          <p>
            Le informazioni fornite quando si utilizzano i Servizi non sono destinate alla distribuzione o all'uso da parte di qualsiasi persona o entità in qualsiasi giurisdizione o paese dove tale distribuzione o uso sarebbe contrario alla legge o al regolamento o che ci sottoporrebbe a requisiti di registrazione. Coloro che accedono ai Servizi da altre località lo fanno di propria iniziativa e sono gli unici responsabili della conformità alle leggi locali.
          </p>
          <p>
            I Servizi non sono personalizzati per rispettare specifiche normative del settore (come HIPAA o FISMA); se le tue interazioni devono soddisfare tali standard, non puoi utilizzare i Servizi. Inoltre, non puoi utilizzare i Servizi in modo che violi il Gramm-Leach-Bliley Act (GLBA).
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property-rights",
      title: "Diritti di Proprietà Intellettuale",
      content: (
        <div className="space-y-4">
          <h3><strong>La Nostra Proprietà Intellettuale</strong></h3>
          <p>
            Siamo proprietari o licenziatari di tutti i diritti di proprietà intellettuale nei Servizi, inclusi tutto il codice sorgente, database, funzionalità, software, design del sito web, audio, video, testi, fotografie e grafici (collettivamente, il "Contenuto"), così come i marchi commerciali, marchi di servizio e loghi (i "Marchi").
          </p>
          <p>
            Il nostro Contenuto e i Marchi sono protetti da copyright, marchi commerciali e altre leggi e trattati sulla proprietà intellettuale in tutto il mondo.
          </p>
          <p>
            Il Contenuto e i Marchi sono forniti "COSÌ COME SONO" solo per il tuo uso personale, non commerciale o per scopi aziendali interni.
          </p>
          <h3><strong>Il Tuo Utilizzo dei Nostri Servizi</strong></h3>
          <p>
            Soggetto alla tua conformità con questi Termini Legali (inclusa la sezione "Attività Proibite" di seguito), ti concediamo una licenza non esclusiva, non trasferibile e revocabile per:
          </p>
          <ol className="pl-4">
            <li>- Accedere ai Servizi;</li>
            <li>- Scaricare o stampare una copia di qualsiasi porzione del Contenuto a cui hai legalmente avuto accesso.</li>
          </ol>
          <p>
            Questa licenza è esclusivamente per il tuo uso personale e non commerciale. Qualsiasi altro uso dei Servizi, Contenuto o Marchi senza il nostro permesso scritto esplicito è vietato.
          </p>
          <p>
            Se desideri utilizzare i Servizi, il Contenuto o i Marchi in qualsiasi altro modo, ti preghiamo di contattarci a <a href="mailto:contact@cloudnotes.com">contact@cloudnotes.com</a>.
          </p>
          <p>
            Ci riserviamo tutti i diritti non espressamente concessi qui. Qualsiasi violazione di questi Diritti di Proprietà Intellettuale costituirà una violazione materiale di questi Termini Legali e comporterà la terminazione immediata del tuo diritto di utilizzare i Servizi.
          </p>
        </div>
      ),
    },
    {
      id: "user-representations",
      title: "Dichiarazioni dell'Utente",
      content: (
        <div className="space-y-4">
          <p>Utilizzando i Servizi, dichiari e garantisci che:</p>
          <ol className="pl-4">
            <li>- Tutte le informazioni di registrazione saranno vere, accurate, aggiornate e complete;</li>
            <li>- Manterrai e aggiornerai queste informazioni quando necessario;</li>
            <li>- Hai la capacità legale di accettare questi Termini Legali;</li>
            <li>- Non sei minorenne, o se lo sei, hai ottenuto il permesso dei genitori;</li>
            <li>- Non utilizzerai mezzi automatizzati (come bot o script) per accedere ai Servizi;</li>
            <li>- Non utilizzerai i Servizi per scopi illegali o non autorizzati; e</li>
            <li>- Il tuo utilizzo dei Servizi rispetta tutte le leggi e regolamenti applicabili.</li>
          </ol>
          <p>
            Se qualsiasi informazione è falsa o incompleta, ci riserviamo il diritto di sospendere o terminare il tuo account.
          </p>
        </div>
      ),
    },
    {
      id: "prohibited-activities",
      title: "Attività Proibite",
      content: (
        <div className="space-y-4">
          <p>
            Puoi utilizzare i Servizi solo per il loro scopo previsto. I Servizi non possono essere utilizzati per attività commerciali a meno che non sia espressamente approvato da noi.
          </p>
          <p>
            Non puoi:
          </p>
          <ol>
            <li>- Recuperare sistematicamente dati per creare un database o directory senza il nostro permesso scritto;</li>
            <li>- Ingannare, frodare o fuorviare noi o altri utenti (per esempio, cercando di ottenere informazioni sensibili dell'account);</li>
            <li>- Aggirare, disabilitare o interferire con le funzionalità di sicurezza dei Servizi;</li>
            <li>- Denigrare, danneggiare o nuocere ai Servizi o a CloudNotes LLC;</li>
            <li>- Utilizzare informazioni dai Servizi per molestare, abusare o danneggiare chiunque;</li>
            <li>- Abusare dei nostri servizi di supporto o inviare false segnalazioni di abuso;</li>
            <li>- Utilizzare i Servizi in violazione di qualsiasi legge o regolamento applicabile;</li>
            <li>- Impegnarsi in frame o collegamento non autorizzato ai Servizi;</li>
            <li>- Caricare o trasmettere virus, cavalli di Troia o materiali dannosi che disturbano i Servizi;</li>
            <li>- Utilizzare strumenti automatizzati (come bot o scraper) per accedere ai Servizi;</li>
            <li>- Rimuovere o alterare qualsiasi avviso di copyright o proprietario dal Contenuto;</li>
            <li>- Impersonare un altro utente o utilizzare il nome utente di qualcun altro;</li>
            <li>- Caricare materiali che servono come meccanismi nascosti di raccolta dati (es. web bug o cookie);</li>
            <li>- Interferire con, disturbare o imporre un carico eccessivo sui Servizi;</li>
            <li>- Molestare, intimidire o minacciare qualsiasi nostro dipendente o agente;</li>
            <li>- Tentare di aggirare le restrizioni di accesso su qualsiasi porzione dei Servizi;</li>
            <li>- Copiare o adattare il nostro software (inclusi Flash, PHP, HTML o JavaScript) senza permesso;</li>
            <li>- Fare reverse engineering, decompilare o disassemblare qualsiasi parte dei Servizi, eccetto come permesso dalla legge;</li>
            <li>- Implementare sistemi automatizzati per accedere ai Servizi senza autorizzazione;</li>
            <li>- Utilizzare agenti di acquisto per fare transazioni sui Servizi;</li>
            <li>- Raccogliere dati personali degli utenti per email non sollecitate o creare account sotto false pretese;</li>
            <li>- Utilizzare i Servizi per competere con noi o per imprese che generano entrate;</li>
            <li>- Vendere o trasferire i dati del tuo profilo;</li>
            <li>- Utilizzare i Servizi per pubblicizzare o offrire beni e servizi.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "term-and-termination",
      title: "Durata e Risoluzione",
      content: (
        <div className="space-y-4">
          <p>
            Questi Termini Legali rimangono in pieno vigore mentre utilizzi i Servizi.{" "}
            <strong>
              Senza limitare altre disposizioni, ci riserviamo il diritto di negare l'accesso (incluso il blocco degli indirizzi IP) a nostra esclusiva discrezione e senza preavviso per qualsiasi violazione di questi termini o della legge applicabile.
            </strong>
          </p>
          <p>
            Se terminiamo o sospendiamo il tuo account, non puoi registrare un nuovo account con il tuo nome, un nome falso o preso in prestito, o per conto di una terza parte. Ci riserviamo anche il diritto di perseguire azioni legali, inclusi rimedi civili, penali e ingiuntivi.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      title: "Legge Applicabile",
      content: (
        <div className="space-y-4">
          <p>
            Questi Termini Legali sono regolati dalle leggi d'Italia, escludendo la Convenzione delle Nazioni Unite sui Contratti per la Vendita Internazionale di Merci. Se risiedi nell'UE come consumatore, potresti avere diritti aggiuntivi sotto le tue leggi nazionali. Sia CloudNotes LLC che tu accettate di sottomettervi alla giurisdizione non esclusiva dei tribunali della Sardegna.
          </p>
        </div>
      ),
    },
    {
      id: "disclaimer",
      title: "Esclusione di Responsabilità",
      content: (
        <div className="space-y-4">
          <p>
            I Servizi sono forniti "così come sono" e "come disponibili". Il tuo utilizzo è a tuo rischio. Nella misura massima consentita dalla legge, escludiamo tutte le garanzie, esplicite o implicite, incluse le garanzie di commerciabilità, idoneità per uno scopo particolare e non violazione. Non garantiamo l'accuratezza o la completezza del contenuto dei Servizi e non siamo responsabili per errori, danni o interruzioni derivanti dal suo utilizzo. Ti preghiamo di esercitare cautela con qualsiasi prodotto o servizio di terze parti qui menzionato.
          </p>
        </div>
      ),
    },
    {
      id: "limitations-of-liability",
      title: "Limitazioni di Responsabilità",
      content: (
        <div className="space-y-4">
          <p>
            In nessun caso noi, i nostri direttori, dipendenti o agenti saremo responsabili per danni diretti, indiretti, consequenziali, esemplari, incidentali, speciali o punitivi (inclusi profitti persi, entrate o dati) derivanti dal tuo utilizzo dei Servizi, anche se siamo stati avvisati della possibilità di tali danni. La nostra responsabilità totale verso di te sarà limitata all'importo che ci hai pagato, se presente, soggetto alla legge applicabile.
          </p>
        </div>
      ),
    },
    {
      id: "contact-us",
      title: "Contattaci",
      content: (
        <div className="space-y-4">
          <p>
            Per risolvere qualsiasi reclamo o per ottenere ulteriori informazioni riguardo ai Servizi, ti preghiamo di contattarci a:
          </p>
          <div className="contact-info select-none">
            <p>CloudNotes LLC</p>
            <p>Pescheria del Porto di Cagliari</p>
            <p>Cagliari, Cagliari 09125</p>
            <p>Italia</p>
            <p>
              Telefono: <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>
            </p>
            <p>
              Email: <AppLink href="mailto:contact@cloudnotes.com" external>contact@cloudnotes.com</AppLink>
            </p>
          </div>
        </div>
      ),
    },
  ];
  
  useEffect(() => {
    if (location.pathname === '/tos') {
      scrollToSection('introduction');
    }
  }, [location.pathname, scrollToSection]);
  
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${cloudsBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      
      {/* Gray overlay */}
      <div className="absolute inset-0 z-0 bg-black/15" aria-hidden="true" />
      
      {/* Main content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-background/95 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold select-none">Termini di Servizio</h2>
                              <p className="text-sm text-foreground/80 mt-1 select-none">Ultimo aggiornamento: {lastUpdated}</p>
            </div>
            <Button 
              variant="default" 
              className="rounded-full flex items-center gap-2 !px-8 cursor-pointer select-none"
              onClick={() => setIsPrintModalOpen(true)}
              aria-label="Print Terms of Service"
            >
              <PrinterIcon className="size-4" />
              Stampa
            </Button>
          </div>
          
          {/* Flex container for sidebar and content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar navigation */}
            <aside className="lg:w-1/5 xl:w-3/10">
              <div className="lg:sticky lg:top-8">
                <nav className="bg-background/50 backdrop-blur-sm rounded-lg shadow-sm p-4 select-none">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Navigazione</h3>
                  <div className="space-y-1 custom-scrollbar">
                    {sections.map((section, index) => (
                      <div key={section.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <button
                          type="button"
                          className={cn(
                            "tos-nav-link w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-start",
                            "hover-primary-effect cursor-pointer",
                            activeSection === section.id 
                              ? "text-primary font-medium bg-primary/5" 
                              : "text-foreground"
                          )}
                          onClick={() => scrollToSection(section.id)}
                          data-section={section.id}
                          aria-current={activeSection === section.id ? "true" : "false"}
                        >
                          <span className="text-primary font-semibold min-w-6 mr-2">{index + 1}.</span>
                          <span>{section.title}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </aside>
            
            {/* Main content */}
            <div className="lg:w-4/5 xl:w-5/6">
              <div className="prose prose-slate max-w-none">
                {sections.map((section, index) => (
                  <div key={section.id}>
                    <section 
                      id={section.id}
                      ref={(el) => {
                        sectionRefs.current[section.id] = el;
                      }}
                      className={cn(
                        "scroll-mt-24 transition-colors duration-500 rounded-lg p-4",
                        activeSection === section.id ? "bg-primary/[0.06]" : ""
                      )}
                      aria-labelledby={`heading-${section.id}`}
                    >
                      <h3 
                        id={`heading-${section.id}`}
                        className="text-xl font-semibold mb-4 text-foreground flex items-center"
                      >
                        <span className="inline-block mr-2 text-primary font-bold">{index + 1}.</span> {section.title}
                      </h3>
                      <div className="text-foreground leading-relaxed">
                        {section.content}
                      </div>
                    </section>
                    
                    {index < sections.length - 1 && (
                      <Separator className="my-8 md:my-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Print modal */}
      <PrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sections={sections}
        title="Termini di Servizio CloudNotes"
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
