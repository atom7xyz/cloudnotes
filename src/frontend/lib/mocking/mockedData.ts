import type { MockUser, MockDocument, MockComment, MockRating, MockBookmark, MockFile } from './mocked';
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
  
  private constructor() {
    console.log('Initializing mock data store');
    this.generateUsers();
    this.generateDocuments();
    this.generateCommentsAndRatings();
    this.generateBookmarks();
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
      'Classical literature professor specializing in Greek and Roman epic poetry',
      'Philosophy researcher with focus on Stoicism and its applications in modern therapy',
      'Political philosophy researcher at Oxford',
      'Biblical studies scholar with expertise in historical-critical method',
      'Comparative mythology researcher and teacher focusing on European myths',
      'Medieval European history professor and author',
      'Business strategy consultant with background in military history',
      'Italian literature specialist with focus on Dante and the Renaissance'
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
      bio: "Opera enthusiast and classical music aficionado with expertise in European opera history",
      joinDate: faker.date.past({ years: 1 })
    };
    
    this.users.push(bartSimpson);
  }
  
  private generateDocuments(): void {
    const documentTitles = [
      'The Iliad: Critical Analysis and Commentary',
      'Meditations by Marcus Aurelius: Stoicism in Practice',
      'The Republic: Plato\'s Vision of Justice',
      'The Bible: Historical Context and Literary Structure',
      'The Odyssey: Journey of Transformation',
      'The Canterbury Tales: Chaucer\'s Medieval Masterpiece',
      'On War: Clausewitz\'s Military Theory and Strategy',
      'Dante\'s Divine Comedy: The Journey Through Afterlife',
      'Gilgamesh: The World\'s First Epic Hero',
      'Machiavelli\'s The Prince: Power Politics Then and Now',
      'Don Quixote: Cervantes and the Birth of the Modern Novel',
      'Beowulf: The Oldest English Epic'
    ];
    
    const documentDescriptions = [
      'A comprehensive literary analysis of Homer\'s epic poem "The Iliad", examining themes of war, honor, and divine intervention.',
      'An exploration of Stoic philosophy through the personal writings of Roman Emperor Marcus Aurelius.',
      'A detailed study of Plato\'s "Republic" focusing on concepts of justice, governance, and the ideal society.',
      'A scholarly examination of the historical development, literary forms, and cultural contexts of biblical texts.',
      'An interpretive analysis of Homer\'s "Odyssey", examining the hero\'s journey and mythological elements.',
      'A critical examination of Geoffrey Chaucer\'s landmark work exploring the social fabric of medieval England.',
      'An analysis of Carl von Clausewitz\'s influential treatise on military theory and its impact on European strategic thinking.',
      'A literary exploration of Dante Alighieri\'s epic poem, examining its allegorical structure and themes.',
      'Analyzing the Epic of Gilgamesh as the earliest surviving work of great literature.',
      'Examining Niccolò Machiavelli\'s controversial political treatise on power and governance.',
      'A thorough study of Miguel de Cervantes\' revolutionary novel and its place in European literary tradition.',
      'A thorough analysis of the Old English heroic epic poem Beowulf and its cultural significance.'
    ];
    
    const tagsPool = [
      ['ancient', 'literature', 'homer', 'greek'],
      ['stoicism', 'philosophy', 'ethics'],
      ['plato', 'philosophy', 'justice'],
      ['religion', 'history', 'literature'],
      ['homer', 'greek', 'mythology'],
      ['medieval', 'english', 'literature', 'chaucer'],
      ['strategy', 'military', 'theory', 'european', 'warfare'],
      ['dante', 'medieval', 'italian', 'poetry'],
      ['mesopotamia', 'epic', 'poetry', 'ancient'],
      ['machiavelli', 'politics', 'renaissance'],
      ['spanish', 'literature', 'renaissance', 'cervantes'],
      ['medieval', 'old', 'english', 'epic', 'poetry']
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
        isPublic: Math.random() > 0.2, // 80% chance of being public
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
        file: file
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
          title: "Wagner's Ring Cycle: A Complete Analysis",
          description: "A comprehensive exploration of Richard Wagner's monumental four-opera cycle 'Der Ring des Nibelungen', examining its revolutionary musical techniques, complex mythology, and profound philosophical themes.",
          tags: ['opera', 'wagner', 'classical', 'music', 'german', 'mythology', 'leitmotif', 'nibelungen'],
          type: 'pdf',
          color: '#8C4646', // Darker red for good contrast with white text
          text: 'Wagner%27s%20Ring'
        },
        {
          title: "Verdi's Italian Operas and Political Influence",
          description: "An examination of Giuseppe Verdi's operatic masterpieces within the context of Italian unification, analyzing how his works reflected and inspired the Risorgimento movement while establishing a distinctly Italian operatic tradition.",
          tags: ['opera', 'verdi', 'classical', 'music', 'italian', 'political', 'risorgimento', 'nationalism'],
          type: 'epub',
          color: '#3A5683', // Dark blue for good contrast with white text
          text: 'Verdi%20Operas'
        },
        {
          title: "Mozart's Operas: The Evolution of a Genius",
          description: "An in-depth study of Wolfgang Amadeus Mozart's operatic works, tracing his development from youthful compositions to his mature masterpieces, with analysis of his innovative musical language and character development techniques.",
          tags: ['opera', 'mozart', 'classical', 'music', 'austrian', 'enlightenment', 'character', 'composition'],
          type: 'pdf',
          color: '#2C4770', // Dark blue-gray for good contrast with white text
          text: 'Mozart%20Operas'
        },
        {
          title: "Puccini and Italian Verismo: Realism in Opera",
          description: "A detailed examination of Giacomo Puccini's contributions to the verismo movement in Italian opera, analyzing his realistic portrayal of everyday characters and emotional directness that revolutionized late 19th and early 20th century operatic composition.",
          tags: ['opera', 'puccini', 'classical', 'music', 'italian', 'verismo', 'realism', 'boheme', 'butterfly'],
          type: 'epub',
          color: '#56452C', // Dark brown for good contrast with white text
          text: 'Puccini%20Verismo'
        },
        {
          title: "The History of Opera Houses in Europe",
          description: "A comprehensive architectural and cultural history of Europe's greatest opera houses, from La Scala in Milan to the Paris Opera, exploring their design, acoustics, social significance, and ongoing legacy in contemporary performance spaces.",
          tags: ['opera', 'architecture', 'europe', 'cultural', 'history', 'performance', 'acoustics', 'design'],
          type: 'pdf',
          color: '#644D7A', // Deep purple for good contrast with white text
          text: 'Opera%20Houses'
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
          isPublic: true,
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
          file: file
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
  
  // =========== DATA ACCESS ===========
  
  public getUsers(): MockUser[] {
    return [...this.users];
  }
  
  public getDocuments(): MockDocument[] {
    return [...this.documents];
  }
  
  public getPublicDocuments(): MockDocument[] {
    return this.documents.filter(doc => doc.file.isPublic);
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
      isPublic: docData.file?.isPublic !== undefined ? docData.file.isPublic : true,
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
      file: file
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
  
  public toggleDocumentPublic(documentId: string): boolean {
    const document = this.getDocumentById(documentId);
    if (!document) return false;
    
    document.file.isPublic = !document.file.isPublic;
    return true;
  }
  
  // Helper method to get document average rating
  public getDocumentAverageRating(documentId: string): number {
    const document = this.getDocumentById(documentId);
    if (!document) return 0;
    
    return document.rating.rating;
  }
}

// Initialize the mock data store
const mockDataStore = MockDataStore.getInstance();

// Define recent searches
const recentSearches: string[] = [
  "@pdf Analysis",
  "philosophy",
  "@epub @mythology the odyssey",
  "plato",
  "literature",
  "@italian Dante's Divine Comedy",
  "@powerpoint poetry"
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
  toggleDocumentPublic: (documentId: string) => mockDataStore.toggleDocumentPublic(documentId),
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
  
  getRecentSearches: () => recentSearches
}; 