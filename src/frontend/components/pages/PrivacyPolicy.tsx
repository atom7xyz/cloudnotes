import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import cloudsBackground from "../../assets/clouds3.jpg";
import { PrinterIcon } from "lucide-react";
import PrintModal from "../modals/PrintModal";
import { AppLink } from "@/components/ui/app-link";

// Section type definition
interface PrivacySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicy() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const lastUpdated = "15 Maggio 2024";
  
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
  
  const sections: PrivacySection[] = [
    {
      id: "introduction",
      title: "Introduzione",
      content: (
        <div className="space-y-4">
          <p>
            Noi di CloudNotes LLC ("noi," "nostro"), rispettiamo la tua privacy e siamo impegnati a proteggere i tuoi dati personali. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, divulghiamo e proteggiamo le tue informazioni quando utilizzi i nostri servizi.
          </p>
          <p>
            Gestiamo il sito web <strong>cloudnotes.com</strong> (il "Sito"), così come qualsiasi altro prodotto e servizio correlato che fa riferimento o si collega a questa informativa sulla privacy (collettivamente, i "Servizi").
          </p>
          <p>
            Ti preghiamo di leggere attentamente questa informativa sulla privacy. Se non sei d'accordo con le nostre politiche e pratiche, ti preghiamo di non utilizzare i nostri Servizi. Accedendo o utilizzando i nostri Servizi, accetti questa informativa sulla privacy.
          </p>
          <p>
            Puoi contattarci per domande o preoccupazioni riguardo alle nostre pratiche sulla privacy via email a <AppLink href="mailto:privacy@cloudnotes.com" external>privacy@cloudnotes.com</AppLink>, per telefono al <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>, o per posta a Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125, Italia.
          </p>
        </div>
      ),
    },
    {
      id: "information-we-collect",
      title: "Informazioni che Raccogliamo",
      content: (
        <div className="space-y-4">
          <p>
            Raccogliamo diversi tipi di informazioni da e sui utenti dei nostri Servizi, incluse:
          </p>
          <h3><strong>Dati Personali</strong></h3>
          <p>
            Potremmo raccogliere informazioni personali che fornisci volontariamente quando utilizzi i nostri Servizi, incluse:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informazioni di contatto (come nome, indirizzo email, numero di telefono)</li>
            <li>Credenziali dell'account (come nomi utente e password)</li>
            <li>Informazioni del profilo (come foto del profilo e background educativo)</li>
            <li>Contenuti che carichi sui nostri Servizi (come note, documenti e commenti)</li>
            <li>Informazioni di pagamento quando effettui acquisti (elaborate dai nostri fornitori di pagamento)</li>
            <li>Feedback e corrispondenza (come richieste di supporto o risposte a sondaggi)</li>
          </ul>
          
          <h3><strong>Informazioni Raccolte Automaticamente</strong></h3>
          <p>
            Quando utilizzi i nostri Servizi, potremmo raccogliere automaticamente certe informazioni sul tuo dispositivo e su come interagisci con i nostri Servizi:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informazioni del dispositivo (come indirizzo IP, tipo di browser, sistema operativo)</li>
            <li>Dati di utilizzo (come pagine visitate, funzionalità utilizzate, tempo trascorso sul sito)</li>
            <li>Dati di localizzazione (come posizione geografica generale basata sull'indirizzo IP)</li>
            <li>Cookie e tecnologie di tracciamento simili (come descritto nella nostra Politica sui Cookie)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "how-we-use-information",
      title: "Come Utilizziamo le Tue Informazioni",
      content: (
        <div className="space-y-4">
          <p>
            Utilizziamo le informazioni che raccogliamo per vari scopi, inclusi:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornire, mantenere e migliorare i nostri Servizi</li>
            <li>Creare e gestire il tuo account</li>
            <li>Elaborare transazioni e inviare informazioni correlate</li>
            <li>Rispondere alle tue richieste e fornire supporto clienti</li>
            <li>Inviare messaggi amministrativi, aggiornamenti e avvisi di sicurezza</li>
            <li>Inviare comunicazioni promozionali se hai scelto di riceverle</li>
            <li>Personalizzare la tua esperienza con i nostri Servizi</li>
            <li>Analizzare i modelli di utilizzo per migliorare i nostri Servizi</li>
            <li>Proteggere i nostri Servizi e utenti da attività fraudolente, dannose o illegali</li>
            <li>Rispettare le obbligazioni legali</li>
          </ul>
          
          <p>
            Elaboriamo le tue informazioni personali solo quando abbiamo una base legale valida per farlo, inclusa:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Il tuo consenso</li>
            <li>L'esecuzione di un contratto con te</li>
            <li>Il rispetto di un obbligo legale</li>
            <li>La protezione dei tuoi interessi vitali o di quelli di un'altra persona</li>
            <li>I nostri interessi legittimi (che bilanceiamo contro i tuoi diritti e interessi)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "information-sharing",
      title: "Condivisione e Divulgazione delle Informazioni",
      content: (
        <div className="space-y-4">
          <p>
            Potremmo condividere le tue informazioni nelle seguenti situazioni:
          </p>
          <h3><strong>Fornitori di Servizi di Terze Parti</strong></h3>
          <p>
            Potremmo condividere le tue informazioni con fornitori terzi, prestatori di servizi, appaltatori o agenti che svolgono servizi per nostro conto, come:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornitori di hosting cloud e infrastrutture</li>
            <li>Processori di pagamento</li>
            <li>Fornitori di analytics</li>
            <li>Servizi di supporto clienti</li>
            <li>Fornitori di servizi email</li>
          </ul>
          <p>
            Queste terze parti sono autorizzate solo a utilizzare le tue informazioni personali per fornire servizi a noi e sono tenute a mantenere la riservatezza e la sicurezza delle tue informazioni.
          </p>
          
          <h3><strong>Trasferimenti Aziendali</strong></h3>
          <p>
            Se siamo coinvolti in una fusione, acquisizione o vendita di tutti o parte dei nostri beni, le tue informazioni potrebbero essere trasferite come parte di quella transazione. Ti notificheremo qualsiasi cambiamento di proprietà o utilizzo delle tue informazioni personali.
          </p>
          
          <h3><strong>Requisiti Legali</strong></h3>
          <p>
            Potremmo divulgare le tue informazioni se richiesto dalla legge o in risposta a richieste valide da parte di autorità pubbliche (ad es., un tribunale o agenzia governativa).
          </p>
          
          <h3><strong>Protezione dei Diritti</strong></h3>
          <p>
            Potremmo divulgare le tue informazioni quando riteniamo che la divulgazione sia necessaria per:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proteggere i nostri diritti, proprietà o sicurezza</li>
            <li>Proteggere i diritti, proprietà o sicurezza dei nostri utenti o altri</li>
            <li>Investigare frodi, problemi di sicurezza o tecnici</li>
            <li>Far rispettare i nostri termini di servizio</li>
          </ul>
          
          <h3><strong>Con il Tuo Consenso</strong></h3>
          <p>
            Potremmo condividere le tue informazioni con terze parti quando ci hai dato il tuo consenso per farlo.
          </p>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "Sicurezza dei Dati",
      content: (
        <div className="space-y-4">
          <p>
            Implementiamo misure tecniche e organizzative appropriate per proteggere le tue informazioni personali contro elaborazioni non autorizzate o illegali, perdite accidentali, distruzione o danni. Tuttavia, nessun metodo di trasmissione su Internet o di archiviazione elettronica è sicuro al 100%. Mentre ci sforziamo di utilizzare mezzi commercialmente accettabili per proteggere le tue informazioni personali, non possiamo garantire la loro sicurezza assoluta.
          </p>
          <p>
            Limitiamo l'accesso alle tue informazioni personali a dipendenti, agenti, appaltatori e altre terze parti che hanno una necessità aziendale di conoscerle. Sono soggetti a obblighi di riservatezza e possono elaborare le tue informazioni personali solo secondo le nostre istruzioni.
          </p>
          <p>
            In caso di una violazione dei dati che interessa le tue informazioni personali, ti notificheremo e informeremo le autorità competenti come richiesto dalla legge applicabile.
          </p>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "I Tuoi Diritti sulla Privacy",
      content: (
        <div className="space-y-4">
          <p>
            A seconda della tua posizione, potresti avere i seguenti diritti riguardo alle tue informazioni personali:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Accesso:</strong> Puoi richiedere una copia delle informazioni personali che conserviamo su di te.</li>
            <li><strong>Correzione:</strong> Puoi richiedere che correggiamo qualsiasi informazione incompleta o inaccurata che conserviamo su di te.</li>
            <li><strong>Cancellazione:</strong> Puoi richiedere che cancelliamo le tue informazioni personali in certe circostanze.</li>
            <li><strong>Limitazione:</strong> Puoi richiedere che limitiamo l'elaborazione delle tue informazioni personali in certe circostanze.</li>
            <li><strong>Portabilità:</strong> Puoi richiedere di ricevere una copia delle tue informazioni personali in un formato strutturato, comunemente utilizzato e leggibile da macchina.</li>
            <li><strong>Obiezione:</strong> Puoi opporti all'elaborazione delle tue informazioni personali in certe circostanze.</li>
            <li><strong>Ritiro del Consenso:</strong> Se ci basiamo sul tuo consenso per elaborare le tue informazioni personali, hai il diritto di ritirare quel consenso in qualsiasi momento.</li>
          </ul>
          <p>
            Per esercitare uno qualsiasi di questi diritti, ti preghiamo di contattarci utilizzando le informazioni di contatto fornite all'inizio di questa politica. Potremmo dover verificare la tua identità prima di rispondere alla tua richiesta.
          </p>
          <p>
            Ti preghiamo di notare che alcuni di questi diritti potrebbero essere limitati o non applicabili in certe giurisdizioni o sotto certe circostanze.
          </p>
        </div>
      ),
    },
    {
      id: "international-transfers",
      title: "Trasferimenti Internazionali di Dati",
      content: (
        <div className="space-y-4">
          <p>
            Potremmo archiviare ed elaborare le tue informazioni nell'Unione Europea e in altri paesi dove noi o i nostri fornitori di servizi operiamo. Questi paesi potrebbero avere leggi sulla protezione dei dati diverse da quelle del tuo paese.
          </p>
          <p>
            Quando trasferiamo le tue informazioni personali in paesi al di fuori dello Spazio Economico Europeo (SEE), garantiamo che siano in atto salvaguardie appropriate per proteggere le tue informazioni, come:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Trasferire in paesi che sono stati riconosciuti come fornitori di un livello adeguato di protezione legale</li>
            <li>Implementare clausole contrattuali standard approvate dalla Commissione Europea</li>
            <li>Utilizzare altri meccanismi di trasferimento legalmente approvati</li>
          </ul>
        </div>
      ),
    },
    {
      id: "children-privacy",
      title: "Privacy dei Minori",
      content: (
        <div className="space-y-4">
          <p>
            I nostri Servizi non sono diretti a bambini di età inferiore ai 16 anni. Non raccogliamo consapevolmente informazioni personali da bambini di età inferiore ai 16 anni. Se veniamo a sapere di aver raccolto informazioni personali da un bambino di età inferiore ai 16 anni senza il consenso dei genitori, prenderemo provvedimenti per cancellare tali informazioni il prima possibile.
          </p>
          <p>
            Se sei un genitore o tutore e credi che tuo figlio ci abbia fornito informazioni personali senza il tuo consenso, ti preghiamo di contattarci così che possiamo prendere le azioni appropriate.
          </p>
        </div>
      ),
    },
    {
      id: "policy-changes",
      title: "Modifiche a Questa Informativa sulla Privacy",
      content: (
        <div className="space-y-4">
          <p>
            Potremmo aggiornare questa informativa sulla privacy di volta in volta per riflettere cambiamenti nelle nostre pratiche o per altre ragioni operative, legali o normative. Ti notificheremo qualsiasi cambiamento materiale pubblicando la nuova informativa sulla privacy su questa pagina e aggiornando la data "Ultimo aggiornamento".
          </p>
          <p>
            Ti incoraggiamo a rivedere questa informativa sulla privacy periodicamente per eventuali cambiamenti. Il tuo uso continuato dei nostri Servizi dopo qualsiasi cambiamento a questa informativa sulla privacy costituisce la tua accettazione della politica aggiornata.
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
            Se hai domande o preoccupazioni riguardo a questa informativa sulla privacy o alle nostre pratiche sulla privacy, ti preghiamo di contattarci a:
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
              Email: <AppLink href="mailto:privacy@cloudnotes.com" external>privacy@cloudnotes.com</AppLink>
            </p>
          </div>
        </div>
      ),
    },
  ];
  
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
              <h2 className="text-2xl sm:text-3xl font-bold select-none">Informativa sulla Privacy</h2>
              <p className="text-sm text-foreground/80 mt-1 select-none">Ultimo aggiornamento: {lastUpdated}</p>
            </div>
            <Button 
              variant="default" 
              className="rounded-full flex items-center gap-2 !px-8 cursor-pointer select-none"
              onClick={() => setIsPrintModalOpen(true)}
              aria-label="Stampa Informativa sulla Privacy"
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
        title="Privacy Policy"
        lastUpdated={lastUpdated}
      />
    </div>
  );
} 