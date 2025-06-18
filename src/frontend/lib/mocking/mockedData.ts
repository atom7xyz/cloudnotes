import type { MockUser, MockDocument, MockComment, MockRating, MockBookmark, MockFile, MockReport } from './mocked';
import { faker } from '@faker-js/faker';

// Set a fixed seed for reproducible data
faker.seed(101);

// =========== DATA STORE CLASS ===========
class MockDataStore {
  private static instance: MockDataStore;
  
  private users: MockUser[] = [];
  private documents: MockDocument[] = [];
  private comments: MockComment[] = [];
  private ratings: MockRating[] = [];
  private bookmarks: MockBookmark[] = [];
  private files: MockFile[] = [];
  private reports: MockReport[] = [];
  
  private constructor() {
    console.log('Initializing mock data store');
    this.generateUsers();
    this.generateDocuments();
    this.generateCommentsAndRatings();
    this.generateBookmarks();
    this.generateReports();
  }
  
  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }
  
  // =========== DATA GENERATION ===========
  
  private generateUsers(): void {
    const scholarlyBackgrounds = [
      'Professore di letteratura classica specializzato in poesia epica greca e romana',
      'Ricercatore di filosofia con focus sullo stoicismo e le sue applicazioni nella terapia moderna',
      'Ricercatore di filosofia politica ad Oxford',
      'Studioso di studi biblici con competenza nel metodo storico-critico',
      'Ricercatore e insegnante di mitologia comparata focalizzato sui miti europei',
      'Professore di storia medievale europea e autore',
      'Consulente di strategia aziendale con background in storia militare',
      'Specialista di letteratura italiana con focus su Dante e il Rinascimento'
    ];
    
    for (let i = 0; i < 8; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
      
      const user: MockUser = {
        id: faker.string.uuid(),
        firstName,
        lastName,
        username,
        avatar: `https://i.pravatar.cc/150?u=${username}`,
        comments: [],
        ratings: [],
        documents: [],
        savedDocuments: [],
        bio: scholarlyBackgrounds[i],
        joinDate: faker.date.past({ years: 3 })
      };
      
      this.users.push(user);
    }

    // Add a special "bartsimpson" user for demonstration purposes
    const bartSimpson: MockUser = {
      id: faker.string.uuid(),
      firstName: "Bart",
      lastName: "Simpson",
      username: "bartsimpson",
      avatar: "https://github.com/shadcn.png",
      comments: [],
      ratings: [],
      documents: [],
      savedDocuments: [],
      bio: "Appassionato di opera e musica classica con competenza nella storia dell'opera europea",
      joinDate: faker.date.past({ years: 1 })
    };
    
    this.users.push(bartSimpson);
  }
  
  private generateDocuments(): void {
    const documentTitles = [
      'L\'Iliade: Analisi Critica e Commento',
      'Meditazioni di Marco Aurelio: Lo Stoicismo in Pratica',
      'La Repubblica: La Visione di Platone della Giustizia',
      'La Bibbia: Contesto Storico e Struttura Letteraria',
      'L\'Odissea: Viaggio di Trasformazione',
      'I Racconti di Canterbury: Il Capolavoro Medievale di Chaucer',
      'Della Guerra: Teoria Militare e Strategia di Clausewitz',
      'La Divina Commedia di Dante: Il Viaggio Attraverso l\'Aldilà',
      'Gilgamesh: Il Primo Eroe Epico del Mondo',
      'Il Principe di Machiavelli: Politica di Potere Ieri e Oggi',
      'Don Chisciotte: Cervantes e la Nascita del Romanzo Moderno',
      'Beowulf: L\'Epica Inglese più Antica'
    ];
    
    const documentDescriptions = [
      'Un\'analisi letteraria completa del poema epico di Omero "L\'Iliade", che esamina i temi della guerra, dell\'onore e dell\'intervento divino.',
      'Un\'esplorazione della filosofia stoica attraverso gli scritti personali dell\'imperatore romano Marco Aurelio.',
      'Uno studio dettagliato della "Repubblica" di Platone incentrato sui concetti di giustizia, governo e società ideale.',
      'Un esame accademico dello sviluppo storico, delle forme letterarie e dei contesti culturali dei testi biblici.',
      'Un\'analisi interpretativa dell\'"Odissea" di Omero, che esamina il viaggio dell\'eroe e gli elementi mitologici.',
      'Un esame critico dell\'opera fondamentale di Geoffrey Chaucer che esplora il tessuto sociale dell\'Inghilterra medievale.',
      'Un\'analisi del trattato influente di Carl von Clausewitz sulla teoria militare e il suo impatto sul pensiero strategico europeo.',
      'Un\'esplorazione letteraria del poema epico di Dante Alighieri, esaminando la sua struttura allegorica e i suoi temi.',
      'Analizzando l\'Epopea di Gilgamesh come la prima opera di grande letteratura sopravvissuta.',
      'Esaminando il controverso trattato politico di Niccolò Machiavelli sul potere e il governo.',
      'Uno studio approfondito del romanzo rivoluzionario di Miguel de Cervantes e il suo posto nella tradizione letteraria europea.',
      'Un\'analisi approfondita del poema epico eroico inglese antico Beowulf e il suo significato culturale.'
    ];
    
    const tagsPool = [
      ['antico', 'letteratura', 'omero', 'greco'],
      ['stoicismo', 'filosofia', 'etica'],
      ['platone', 'filosofia', 'giustizia'],
      ['religione', 'storia', 'letteratura'],
      ['omero', 'greco', 'mitologia'],
      ['medievale', 'inglese', 'letteratura', 'chaucer'],
      ['strategia', 'militare', 'teoria', 'europeo', 'guerra'],
      ['dante', 'medievale', 'italiano', 'poesia'],
      ['mesopotamia', 'epico', 'poesia', 'antico'],
      ['machiavelli', 'politica', 'rinascimento'],
      ['spagnolo', 'letteratura', 'rinascimento', 'cervantes'],
      ['medievale', 'inglese-antico', 'epico', 'poesia']
    ];
    
    const fileTypes: ('pdf' | 'word' | 'powerpoint' | 'txt' | 'epub')[] = [
      'pdf', 'epub', 'pdf', 'pdf', 'epub', 'pdf', 
      'pdf', 'epub', 'pdf', 'pdf', 'epub', 'pdf'
    ];
    
    for (let i = 0; i < 12; i++) {
      const userIndex = i % this.users.length;
      const author = this.users[userIndex];
      
      // Create the file first
      const file: MockFile = {
        id: faker.string.uuid(),
        author: author,
        thumbnail: `${faker.color.rgb({ format: 'hex', casing: 'lower' })}:${encodeURIComponent(documentTitles[i].split(':')[0])}`,
        type: fileTypes[i],
        size: `${faker.number.float({ min: 1, max: 15, fractionDigits: 1 })} MB`,
        viewCount: i === 3 ? 15000 : faker.number.int({ min: 500, max: 5000 }),
        downloadCount: i === 3 ? 7500 : faker.number.int({ min: 100, max: 2500 }),
        tags: tagsPool[i],
        visibility: (() => {
          const rand = Math.random();
          if (rand < 0.6) return 'private';
          if (rand < 0.8) return 'link-only';
          return 'public';
        })(), // 60% private, 20% link-only, 20% public
        uploadedAt: i === 3 ? new Date() : faker.date.recent({ days: 90 }) // Make the Bible more recent
      };
      
      this.files.push(file);
      
      // Then create the document with a placeholder rating (will be updated later)
      // We need to create a placeholder rating because document and rating have circular references
      const placeholderRating: MockRating = {
        id: faker.string.uuid(),
        author: author,
        document: {} as MockDocument, // Will be updated
        rating: i === 3 ? 5 : 0,
        timestamp: new Date()
      };
      
      const document: MockDocument = {
        id: faker.string.uuid(),
        title: documentTitles[i],
        description: documentDescriptions[i],
        rating: placeholderRating,
        comments: [],
        author: author,
        file: file,
        reports: []
      };
      
      // Update the placeholder reference
      placeholderRating.document = document;
      
      this.documents.push(document);
      
      // Add document to author's documents
      author.documents.push(document);
    }

    // Find the bartsimpson user
    const bartUser = this.users.find(user => user.username === "bartsimpson");
    if (bartUser) {
      // Add European opera documents for Bart Simpson
      const operaDocuments = [
        {
          title: "Il Ciclo dell'Anello di Wagner: Un'Analisi Completa",
          description: "Un'esplorazione completa del monumentale ciclo di quattro opere 'Der Ring des Nibelungen' di Richard Wagner, esaminando le sue tecniche musicali rivoluzionarie, la mitologia complessa e i profondi temi filosofici.",
          tags: ['opera', 'wagner', 'classica', 'musica', 'tedesco', 'mitologia', 'leitmotiv', 'nibelungen'],
          type: 'pdf',
          color: '#8C4646', // Darker red for good contrast with white text
          text: 'Anello%20Wagner'
        },
        {
          title: "Le Opere Italiane di Verdi e l'Influenza Politica",
          description: "Un esame dei capolavori operistici di Giuseppe Verdi nel contesto dell'unificazione italiana, analizzando come le sue opere riflettevano e ispiravano il movimento del Risorgimento stabilendo una tradizione operistica distintamente italiana.",
          tags: ['opera', 'verdi', 'classica', 'musica', 'italiano', 'politico', 'risorgimento', 'nazionalismo'],
          type: 'epub',
          color: '#3A5683', // Dark blue for good contrast with white text
          text: 'Opere%20Verdi'
        },
        {
          title: "Le Opere di Mozart: L'Evoluzione di un Genio",
          description: "Uno studio approfondito delle opere liriche di Wolfgang Amadeus Mozart, tracciando il suo sviluppo dalle composizioni giovanili ai suoi capolavori maturi, con analisi del suo linguaggio musicale innovativo e delle tecniche di sviluppo del carattere.",
          tags: ['opera', 'mozart', 'classica', 'musica', 'austriaco', 'illuminismo', 'carattere', 'composizione'],
          type: 'pdf',
          color: '#2C4770', // Dark blue-gray for good contrast with white text
          text: 'Opere%20Mozart'
        },
        {
          title: "Puccini e il Verismo Italiano: Realismo nell'Opera",
          description: "Un esame dettagliato dei contributi di Giacomo Puccini al movimento verista nell'opera italiana, analizzando la sua rappresentazione realistica di personaggi quotidiani e la franchezza emotiva che rivoluzionò la composizione operistica di fine Ottocento e inizio Novecento.",
          tags: ['opera', 'puccini', 'classica', 'musica', 'italiano', 'verismo', 'realismo', 'boheme', 'butterfly'],
          type: 'epub',
          color: '#56452C', // Dark brown for good contrast with white text
          text: 'Puccini%20Verismo'
        },
        {
          title: "La Storia dei Teatri d'Opera in Europa",
          description: "Una storia architettonica e culturale completa dei più grandi teatri d'opera d'Europa, dalla Scala di Milano all'Opera di Parigi, esplorando il loro design, l'acustica, il significato sociale e l'eredità continua negli spazi di spettacolo contemporanei.",
          tags: ['opera', 'architettura', 'europa', 'culturale', 'storia', 'spettacolo', 'acustica', 'design'],
          type: 'pdf',
          color: '#644D7A', // Deep purple for good contrast with white text
          text: 'Teatri%20Opera'
        }
      ];
      
      // Create the opera documents and assign to Bart
      for (const operaDoc of operaDocuments) {
        // Create the file
        const file: MockFile = {
          id: faker.string.uuid(),
          author: bartUser,
          thumbnail: `${operaDoc.color}:${operaDoc.text}`,
          type: operaDoc.type as 'pdf' | 'epub',
          size: `${faker.number.float({ min: 3, max: 12, fractionDigits: 1 })} MB`,
          viewCount: faker.number.int({ min: 200, max: 1000 }),
          downloadCount: faker.number.int({ min: 50, max: 300 }),
          tags: operaDoc.tags,
          visibility: (() => {
            const rand = Math.random();
            if (rand < 0.6) return 'public';
            if (rand < 0.8) return 'link-only';
            return 'private';
          })(), // 60% public, 20% link-only, 20% private
          uploadedAt: faker.date.recent({ days: 20 })
        };
        
        this.files.push(file);
        
        // Create placeholder rating
        const placeholderRating: MockRating = {
          id: faker.string.uuid(),
          author: bartUser,
          document: {} as MockDocument,
          rating: 0,
          timestamp: new Date()
        };
        
        // Create the document
        const document: MockDocument = {
          id: faker.string.uuid(),
          title: operaDoc.title,
          description: operaDoc.description,
          rating: placeholderRating,
          comments: [],
          author: bartUser,
          file: file,
          reports: []
        };
        
        // Update the placeholder reference
        placeholderRating.document = document;
        
        // Add high ratings
        document.rating.rating = 4.8;
        
        this.documents.push(document);
        
        // Add document to user's documents
        bartUser.documents.push(document);
      }
    }
  }
  
  private generateCommentsAndRatings(): void {
    // Generate 0-7 comments for each document
    for (const document of this.documents) {
      const commentCount = faker.number.int({ min: 0, max: 7 });
      
      for (let i = 0; i < commentCount; i++) {
        // Pick a random user
        const authorIndex = faker.number.int({ min: 0, max: this.users.length - 1 });
        const author = this.users[authorIndex];
        
        const comment: MockComment = {
          id: faker.string.uuid(),
          author: author,
          document: document,
          content: faker.lorem.paragraph(),
          timestamp: faker.date.recent({ days: 60 })
        };
        
        this.comments.push(comment);
        document.comments.push(comment);
        author.comments.push(comment);
      }
      
      // Generate 0-7 ratings for each document
      const ratingCount = faker.number.int({ min: 0, max: 7 });
      let totalRating = 0;
      
      // For each document, we want a different set of users to rate it
      const availableUserIndices = Array.from({ length: this.users.length }, (_, i) => i);
      
      for (let i = 0; i < ratingCount; i++) {
        // If we've used all users, we stop
        if (availableUserIndices.length === 0) break;
        
        // Pick a random user from remaining indices and remove it
        const randomIndex = faker.number.int({ min: 0, max: availableUserIndices.length - 1 });
        const authorIndex = availableUserIndices[randomIndex];
        availableUserIndices.splice(randomIndex, 1);
        
        const author = this.users[authorIndex];
        const rating = faker.number.int({ min: 1, max: 5 });
        totalRating += rating;
        
        const ratingObj: MockRating = {
          id: faker.string.uuid(),
          author: author,
          document: document,
          rating: rating,
          timestamp: faker.date.recent({ days: 60 })
        };
        
        this.ratings.push(ratingObj);
        author.ratings.push(ratingObj);
      }
      
      // Update document's average rating
      if (ratingCount > 0) {
        document.rating.rating = Number.parseFloat((totalRating / ratingCount).toFixed(1));
      }
    }
  }
  
  private generateBookmarks(): void {
    // Each user will have between 1 and 4 saved documents
    for (const user of this.users) {
      const bookmarkCount = faker.number.int({ min: 1, max: 4 });
      
      // Create an array of document indices and shuffle it
      const availableDocIndices = Array.from({ length: this.documents.length }, (_, i) => i);
      for (let i = availableDocIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableDocIndices[i], availableDocIndices[j]] = [availableDocIndices[j], availableDocIndices[i]];
      }
      
      // Use the first bookmarkCount indices
      for (let i = 0; i < bookmarkCount; i++) {
        const documentIndex = availableDocIndices[i];
        const document = this.documents[documentIndex];
        
        const bookmark: MockBookmark = {
          id: faker.string.uuid(),
          user: user,
          document: document,
          timestamp: faker.date.recent({ days: 30 })
        };
        
        this.bookmarks.push(bookmark);
        user.savedDocuments.push(bookmark);
      }
    }
  }
  
  private generateReports(): void {
    // Generate 0-2 reports for some documents (about 30% of documents will have reports)
    for (const document of this.documents) {
      // For Bart Simpson's documents, always generate 1-3 reports for demonstration
      const isBartDocument = document.author.username === 'bartsimpson';
      const shouldHaveReports = isBartDocument || Math.random() < 0.3; // 30% chance for others, 100% for Bart
      if (!shouldHaveReports) continue;
      
      const reportCount = isBartDocument 
        ? faker.number.int({ min: 1, max: 3 }) // 1-3 reports for Bart's docs
        : faker.number.int({ min: 1, max: 2 }); // 1-2 reports for others
      
      for (let i = 0; i < reportCount; i++) {
        // Pick a random user (not the author)
        const availableUsers = this.users.filter(user => user.id !== document.author.id);
        if (availableUsers.length === 0) continue;
        
        const authorIndex = faker.number.int({ min: 0, max: availableUsers.length - 1 });
        const author = availableUsers[authorIndex];
        
        const reportReasons = [
          'C\'è un errore di battitura alla pagina 19 alla linea 5 - "recieve" dovrebbe essere "receive". Spero che questo ti aiuti!',
          'Penso che questa sezione potrebbe richiedere una chiarificazione sul contesto storico menzionato nel paragrafo 3.',
          'Ho trovato un piccolo problema di formattazione alla pagina 12 - la nota a piè di pagina sembra mancare.',
          'La citazione alla pagina 8 sembra incompleta - manca l\'anno di pubblicazione.',
          'C\'è un errore grammaticale nel secondo paragrafo: "was" dovrebbe essere "were" quando si fa riferimento a più soggetti.',
          'Ho notato che la bibliografia manca un accesso per la fonte citata alla pagina 15.',
          'Il diagramma alla pagina 7 è un po\' ambiguo - aggiungere etichette potrebbe aiutare i lettori a capirlo meglio.',
          'Sembra esserci una inconsistenza fattuale tra le date menzionate alle pagine 4 e 11.',
          'Penso che aggiungere un glossario sarebbe utile per i lettori che non sono familiari con alcuni termini tecnici usati.',
          'La conclusione potrebbe beneficiare di una breve sintesi dei punti principali discussi in precedenza.',
          'C\'è un riferimento interno rotto alla pagina 6 - dice "vedi pagina XX" ma il numero di pagina è mancante.',
          'Ho trovato una frase duplicata nel terzo paragrafo dell\'introduzione.',
          'La tabella alla pagina 13 ha alcuni problemi di allineamento che la rendono difficile da leggere.',
          'Penso che questo beneficerebbe di fonti più recenti - la maggior parte delle citazioni sono da prima del 2010.',
          'C\'è un problema di spaziatura nell\'intestazione alla pagina 9 che influisce sulla leggibilità.',
          'Il riassunto potrebbe essere più conciso - attualmente supera la lunghezza tipica per i documenti accademici.',
          'Ho notato alcuni termini inconsistenti - "theatre" vs "theater" è usato in modo intercambiabile.',
          'La sezione metodologica potrebbe richiedere più dettagli sul processo di raccolta dei dati.',
          'C\'è una virgola di chiusura mancante nella citazione alla pagina 16.',
          'Penso che aggiungere i numeri di pagina nella tabella delle mieve sarebbe migliorata la navigazione.'
        ];
        
        const report: MockReport = {
          id: faker.string.uuid(),
          author: author,
          document: document,
          content: reportReasons[faker.number.int({ min: 0, max: reportReasons.length - 1 })],
          timestamp: faker.date.recent({ days: 30 }),
          status: isBartDocument 
            ? (Math.random() < 0.6 ? 'pending' : 'resolved') // 60% pending, 40% resolved for Bart
            : (Math.random() < 0.7 ? 'pending' : 'resolved') // 70% pending, 30% resolved for others
        };
        
        this.reports.push(report);
        document.reports.push(report);
      }
    }
  }
  
  // =========== DATA ACCESS ===========
  
  public getUsers(): MockUser[] {
    return [...this.users];
  }
  
  public getDocuments(): MockDocument[] {
    return [...this.documents];
  }
  
  public getPublicDocuments(): MockDocument[] {
    return this.documents.filter(doc => doc.file.visibility === 'public');
  }
  
  public getBookmarks(): MockBookmark[] {
    return [...this.bookmarks];
  }
  
  public getComments(): MockComment[] {
    return [...this.comments];
  }
  
  public getRatings(): MockRating[] {
    return [...this.ratings];
  }
  
  public getUserById(id: string): MockUser | undefined {
    return this.users.find(user => user.id === id);
  }
  
  public getDocumentById(id: string): MockDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }
  
  public getBookmarksForUser(userId: string): MockBookmark[] {
    return this.bookmarks.filter(bookmark => bookmark.user.id === userId);
  }
  
  public getDocumentsForUser(userId: string): MockDocument[] {
    return this.documents.filter(doc => doc.author.id === userId);
  }
  
  // =========== DATA MODIFICATION ===========
  
  public addUser(userData: Partial<MockUser>): MockUser {
    const newUser: MockUser = {
      id: faker.string.uuid(),
      firstName: userData.firstName || faker.person.firstName(),
      lastName: userData.lastName || faker.person.lastName(),
      username: userData.username || faker.internet.userName(),
      avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.username || faker.internet.userName()}`,
      comments: [],
      ratings: [],
      documents: [],
      savedDocuments: [],
      bio: userData.bio || faker.lorem.paragraph(),
      joinDate: userData.joinDate || new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }
  
  public removeUser(userId: string): boolean {
    const index = this.users.findIndex(user => user.id === userId);
    if (index === -1) return false;
    
    // Remove all associated data
    const user = this.users[index];
    
    // Remove user's documents
    for (const doc of [...user.documents]) {
      this.removeDocument(doc.id);
    }
    
    // Remove user's comments
    for (const comment of [...user.comments]) {
      this.removeComment(comment.id);
    }
    
    // Remove user's ratings
    for (const rating of [...user.ratings]) {
      this.removeRating(rating.id);
    }
    
    // Remove user's bookmarks
    for (const bookmark of [...user.savedDocuments]) {
      this.removeBookmark(bookmark.id);
    }
    
    // Finally remove the user
    this.users.splice(index, 1);
    return true;
  }
  
  public addDocument(docData: Partial<MockDocument>, authorId: string): MockDocument | null {
    const author = this.getUserById(authorId);
    if (!author) return null;
    
    // Create file
    const file: MockFile = {
      id: faker.string.uuid(),
      author: author,
      thumbnail: docData.file?.thumbnail || `${faker.color.rgb({ format: 'hex', casing: 'lower' })}:Document`,
      type: docData.file?.type || 'pdf',
      size: docData.file?.size || `${faker.number.float({ min: 1, max: 15, fractionDigits: 1 })} MB`,
      viewCount: docData.file?.viewCount || 0,
      downloadCount: docData.file?.downloadCount || 0,
      tags: docData.file?.tags || [],
      visibility: (() => {
        const rand = Math.random();
        if (rand < 0.6) return 'public';
        if (rand < 0.8) return 'link-only';
        return 'private';
      })(), // 60% public, 20% link-only, 20% private
      uploadedAt: docData.file?.uploadedAt || new Date()
    };
    
    this.files.push(file);
    
    // Create empty rating
    const initialRating: MockRating = {
      id: faker.string.uuid(),
      author: author,
      document: {} as MockDocument,
      rating: 0,
      timestamp: new Date()
    };
    
    // Create document
    const newDocument: MockDocument = {
      id: faker.string.uuid(),
      title: docData.title || faker.lorem.sentence(),
      description: docData.description || faker.lorem.paragraph(),
      rating: initialRating,
      comments: [],
      author: author,
      file: file,
      reports: []
    };
    
    // Update the rating's document reference
    initialRating.document = newDocument;
    
    this.documents.push(newDocument);
    author.documents.push(newDocument);
    
    return newDocument;
  }
  
  public removeDocument(documentId: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === documentId);
    if (index === -1) return false;
    
    const document = this.documents[index];
    
    // Remove document from author's documents
    const authorDocIndex = document.author.documents.findIndex(doc => doc.id === documentId);
    if (authorDocIndex !== -1) {
      document.author.documents.splice(authorDocIndex, 1);
    }
    
    // Remove associated comments
    for (const comment of [...document.comments]) {
      this.removeComment(comment.id);
    }
    
    // Remove associated bookmarks
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.document.id !== documentId);
    
    // Update users' saved documents
    for (const user of this.users) {
      user.savedDocuments = user.savedDocuments.filter(bookmark => bookmark.document.id !== documentId);
    }
    
    // Remove document
    this.documents.splice(index, 1);
    return true;
  }
  
  public addComment(commentData: Partial<MockComment>, authorId: string, documentId: string): MockComment | null {
    const author = this.getUserById(authorId);
    const document = this.getDocumentById(documentId);
    
    if (!author || !document) return null;
    
    const newComment: MockComment = {
      id: faker.string.uuid(),
      author: author,
      document: document,
      content: commentData.content || faker.lorem.paragraph(),
      timestamp: commentData.timestamp || new Date()
    };
    
    this.comments.push(newComment);
    document.comments.push(newComment);
    author.comments.push(newComment);
    
    return newComment;
  }
  
  public removeComment(commentId: string): boolean {
    const index = this.comments.findIndex(comment => comment.id === commentId);
    if (index === -1) return false;
    
    const comment = this.comments[index];
    
    // Remove from document's comments
    const docCommentIndex = comment.document.comments.findIndex(c => c.id === commentId);
    if (docCommentIndex !== -1) {
      comment.document.comments.splice(docCommentIndex, 1);
    }
    
    // Remove from author's comments
    const authorCommentIndex = comment.author.comments.findIndex(c => c.id === commentId);
    if (authorCommentIndex !== -1) {
      comment.author.comments.splice(authorCommentIndex, 1);
    }
    
    // Remove comment
    this.comments.splice(index, 1);
    return true;
  }
  
  public addRating(ratingData: Partial<MockRating>, authorId: string, documentId: string): MockRating | null {
    const author = this.getUserById(authorId);
    const document = this.getDocumentById(documentId);
    
    if (!author || !document) return null;
    
    // Check if user already rated this document
    const existingRatingIndex = this.ratings.findIndex(
      r => r.author.id === authorId && r.document.id === documentId
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      const existingRating = this.ratings[existingRatingIndex];
      existingRating.rating = ratingData.rating || existingRating.rating;
      existingRating.timestamp = new Date();
      
      this.updateDocumentAverageRating(documentId);
      return existingRating;
    }
    
    // Create new rating
    const newRating: MockRating = {
      id: faker.string.uuid(),
      author: author,
      document: document,
      rating: ratingData.rating || faker.number.int({ min: 1, max: 5 }),
      timestamp: new Date()
    };
    
    this.ratings.push(newRating);
    author.ratings.push(newRating);
    
    this.updateDocumentAverageRating(documentId);
    return newRating;
  }
  
  public removeRating(ratingId: string): boolean {
    const index = this.ratings.findIndex(rating => rating.id === ratingId);
    if (index === -1) return false;
    
    const rating = this.ratings[index];
    const documentId = rating.document.id;
    
    // Remove from author's ratings
    const authorRatingIndex = rating.author.ratings.findIndex(r => r.id === ratingId);
    if (authorRatingIndex !== -1) {
      rating.author.ratings.splice(authorRatingIndex, 1);
    }
    
    // Remove rating
    this.ratings.splice(index, 1);
    
    // Update document average rating
    this.updateDocumentAverageRating(documentId);
    return true;
  }
  
  private updateDocumentAverageRating(documentId: string): void {
    const document = this.getDocumentById(documentId);
    if (!document) return;
    
    const documentRatings = this.ratings.filter(r => r.document.id === documentId);
    
    if (documentRatings.length === 0) {
      document.rating.rating = 0;
    } else {
      const totalRating = documentRatings.reduce((sum, r) => sum + r.rating, 0);
      document.rating.rating = Number.parseFloat((totalRating / documentRatings.length).toFixed(1));
    }
  }
  
  public addBookmark(userId: string, documentId: string): MockBookmark | null {
    const user = this.getUserById(userId);
    const document = this.getDocumentById(documentId);
    
    if (!user || !document) return null;
    
    // Check if bookmark already exists
    const existingBookmark = this.bookmarks.find(
      b => b.user.id === userId && b.document.id === documentId
    );
    
    if (existingBookmark) {
      return existingBookmark;
    }
    
    // Create new bookmark
    const newBookmark: MockBookmark = {
      id: faker.string.uuid(),
      user: user,
      document: document,
      timestamp: new Date()
    };
    
    this.bookmarks.push(newBookmark);
    user.savedDocuments.push(newBookmark);
    
    return newBookmark;
  }
  
  public removeBookmark(bookmarkId: string): boolean {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === bookmarkId);
    if (index === -1) return false;
    
    const bookmark = this.bookmarks[index];
    
    // Remove from user's saved documents
    const userBookmarkIndex = bookmark.user.savedDocuments.findIndex(b => b.id === bookmarkId);
    if (userBookmarkIndex !== -1) {
      bookmark.user.savedDocuments.splice(userBookmarkIndex, 1);
    }
    
    // Removed from saved
    this.bookmarks.splice(index, 1);
    return true;
  }
  
  public setDocumentVisibility(documentId: string, visibility: 'private' | 'public' | 'link-only'): boolean {
    const document = this.getDocumentById(documentId);
    if (!document) return false;
    
    document.file.visibility = visibility;
    return true;
  }
  
  // Helper method to get document average rating
  public getDocumentAverageRating(documentId: string): number {
    const document = this.getDocumentById(documentId);
    if (!document) return 0;
    
    return document.rating.rating;
  }

  // Report management methods
  public getReports(): MockReport[] {
    return this.reports;
  }

  public getReportsForDocument(documentId: string): MockReport[] {
    return this.reports.filter(report => report.document.id === documentId);
  }

  public addReport(reportData: Partial<MockReport>, authorId: string, documentId: string): MockReport | null {
    const author = this.getUserById(authorId);
    const document = this.getDocumentById(documentId);
    
    if (!author || !document) return null;
    
    const newReport: MockReport = {
      id: faker.string.uuid(),
      author: author,
      document: document,
      content: reportData.content || '',
      timestamp: new Date(),
      status: reportData.status || 'pending'
    };
    
    this.reports.push(newReport);
    document.reports.push(newReport);
    
    return newReport;
  }

  public removeReport(reportId: string): boolean {
    const reportIndex = this.reports.findIndex(report => report.id === reportId);
    if (reportIndex === -1) return false;
    
    const report = this.reports[reportIndex];
    
    // Remove from document's reports
    const docReportIndex = report.document.reports.findIndex(r => r.id === reportId);
    if (docReportIndex !== -1) {
      report.document.reports.splice(docReportIndex, 1);
    }
    
    // Remove from main reports array
    this.reports.splice(reportIndex, 1);
    return true;
  }

  public updateReportStatus(reportId: string, status: 'pending' | 'resolved'): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;
    
    report.status = status;
    return true;
  }
}

// Initialize the mock data store
const mockDataStore = MockDataStore.getInstance();

// Define recent searches
const recentSearches: string[] = [
  "#pdf Analisi",
  "filosofia",
  "#epub #mitologia l'odissea",
  "platone",
  "letteratura",
  "#italiano Divina Commedia di Dante",
  "#powerpoint poesia"
];

// Export the API to interact with mock data
export const mockService = {
  // Data access
  getUsers: () => mockDataStore.getUsers(),
  getDocuments: () => mockDataStore.getDocuments(),
  getPublicDocuments: () => mockDataStore.getPublicDocuments(),
  getBookmarks: () => mockDataStore.getBookmarks(),
  getComments: () => mockDataStore.getComments(),
  getRatings: () => mockDataStore.getRatings(),
  getUserById: (id: string) => mockDataStore.getUserById(id),
  getDocumentById: (id: string) => mockDataStore.getDocumentById(id),
  getBookmarksForUser: (userId: string) => mockDataStore.getBookmarksForUser(userId),
  getDocumentsForUser: (userId: string) => mockDataStore.getDocumentsForUser(userId),
  
  // Data modification
  addUser: (userData: Partial<MockUser>) => mockDataStore.addUser(userData),
  removeUser: (userId: string) => mockDataStore.removeUser(userId),
  addDocument: (docData: Partial<MockDocument>, authorId: string) => mockDataStore.addDocument(docData, authorId),
  removeDocument: (documentId: string) => mockDataStore.removeDocument(documentId),
  addComment: (commentData: Partial<MockComment>, authorId: string, documentId: string) => 
    mockDataStore.addComment(commentData, authorId, documentId),
  removeComment: (commentId: string) => mockDataStore.removeComment(commentId),
  addRating: (ratingData: Partial<MockRating>, authorId: string, documentId: string) => 
    mockDataStore.addRating(ratingData, authorId, documentId),
  removeRating: (ratingId: string) => mockDataStore.removeRating(ratingId),
  addBookmark: (userId: string, documentId: string) => mockDataStore.addBookmark(userId, documentId),
  removeBookmark: (bookmarkId: string) => mockDataStore.removeBookmark(bookmarkId),
  setDocumentVisibility: (documentId: string, visibility: 'private' | 'public' | 'link-only') => mockDataStore.setDocumentVisibility(documentId, visibility),
  getDocumentAverageRating: (documentId: string) => mockDataStore.getDocumentAverageRating(documentId),
  
  // Search functions
  searchDocuments: async (query: string): Promise<MockDocument[]> => {
    // Add delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query || query.trim() === '') {
      return mockDataStore.getDocuments();
    }

    const lowerCaseQuery = query.toLowerCase();
    const documents = mockDataStore.getDocuments();
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerCaseQuery) ||
      doc.description.toLowerCase().includes(lowerCaseQuery) ||
      doc.author.username.toLowerCase().includes(lowerCaseQuery) ||
      doc.file.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  },
  
  searchUsers: async (query: string): Promise<MockUser[]> => {
    // Add delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query || query.trim() === '') {
      return [];
    }

    const lowerCaseQuery = query.toLowerCase();
    const users = mockDataStore.getUsers();
    
    return users.filter(user => 
      user.firstName.toLowerCase().includes(lowerCaseQuery) ||
      user.lastName.toLowerCase().includes(lowerCaseQuery) ||
      user.username.toLowerCase().includes(lowerCaseQuery) ||
      user.bio.toLowerCase().includes(lowerCaseQuery)
    );
  },
  
  searchBookmarks: async (query: string): Promise<MockDocument[]> => {
    // Add delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Assume the first user is the current user
    const users = mockDataStore.getUsers();
    if (users.length === 0) return [];
    
    const currentUser = users[0];
    const bookmarkedDocs = currentUser.savedDocuments.map(bookmark => bookmark.document);
    
    if (!query || query.trim() === '') {
      return bookmarkedDocs;
    }

    const lowerCaseQuery = query.toLowerCase();
    
    return bookmarkedDocs.filter(doc => 
      doc.title.toLowerCase().includes(lowerCaseQuery) ||
      doc.description.toLowerCase().includes(lowerCaseQuery) ||
      doc.author.username.toLowerCase().includes(lowerCaseQuery) ||
      doc.file.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  },
  
  getRecentSearches: () => recentSearches,
  
  // Report management
  getReports: () => mockDataStore.getReports(),
  getReportsForDocument: (documentId: string) => mockDataStore.getReportsForDocument(documentId),
  addReport: (reportData: Partial<MockReport>, authorId: string, documentId: string) => 
    mockDataStore.addReport(reportData, authorId, documentId),
  removeReport: (reportId: string) => mockDataStore.removeReport(reportId),
  updateReportStatus: (reportId: string, status: 'pending' | 'resolved') => 
    mockDataStore.updateReportStatus(reportId, status)
}; 