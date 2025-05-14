import { faker } from '@faker-js/faker';

// Set a fixed seed for reproducible data
faker.seed(123);

// Document types
export interface MockDocument {
  id: string;
  name: string;
  uploadDate: Date;
  rating: number;
  commentCount: number;
  uploaderUsername: string;
  uploaderAvatar: string;
  thumbnailUrl: string;
  fileType: 'pdf' | 'word' | 'powerpoint' | 'txt' | 'epub';
  fileSize: string;
  viewCount: number;
  downloadCount: number;
  tags: string[];
  isPublic: boolean;
}

// User types
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  reviewsReceived: number;
  reviewsGiven: number;
  friendsInvited: number;
  savedDocumentsCount: number;
  savedDocuments: string[];
  uploadedDocuments: string[];
  publicDocumentsCount: number;
  totalDocumentsCount: number;
  joinDate: Date;
  bio: string;
}

// Generate a more diverse set of tags for documents
const generateTagPool = (): string[] => {
  const commonTags = [
    'research', 'study', 'notes', 'school', 'work', 'project', 'report',
    'analysis', 'science', 'math', 'history', 'literature', 'physics', 'chemistry',
    'biology', 'medicine', 'engineering', 'computer', 'programming', 'data',
    'statistics', 'business', 'finance', 'marketing', 'management', 'legal',
    'law', 'policy', 'government', 'politics', 'philosophy', 'psychology',
    'social', 'culture', 'language', 'art', 'design', 'music', 'personal'
  ];
  
  return commonTags;
};

// Persistent data store
class PersistentMockData {
  private static instance: PersistentMockData;
  
  private documents: MockDocument[] = [];
  private users: MockUser[] = [];
  private bookmarkedDocuments: MockDocument[] = [];
  private tagPool: string[] = [];
  private recentSearches: string[] = [
    "@science robots in space",
    "cloud computing",
    "@pdf @research quantum physics",
    "machine learning",
    "neural networks"
  ];
  
  private constructor(documentCount = 12, userCount = 8) {
    console.log("Initializing mock data store");
    this.tagPool = generateTagPool();
    this.generateUsers(userCount);
    this.generateDocuments(documentCount);
    this.updateUserDocumentCounts();
    this.generateBookmarks();
  }
  
  public static getInstance(): PersistentMockData {
    if (!PersistentMockData.instance) {
      PersistentMockData.instance = new PersistentMockData();
    }
    return PersistentMockData.instance;
  }
  
  private generateUsers(count: number): void {
    this.users = Array.from({ length: count }, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
      
      return {
        id: faker.string.uuid(),
        firstName,
        lastName,
        username,
        avatar: faker.image.avatar(),
        reviewsReceived: faker.number.int({ min: 0, max: 10 }),
        reviewsGiven: faker.number.int({ min: 0, max: 5 }),
        friendsInvited: faker.number.int({ min: 0, max: 3 }),
        savedDocumentsCount: faker.number.int({ min: 0, max: 6 }),
        savedDocuments: [],
        uploadedDocuments: [],
        publicDocumentsCount: 0,
        totalDocumentsCount: 0,
        joinDate: faker.date.past({ years: 3 }),
        bio: faker.person.bio()
      };
    });
  }
  
  private generateDocuments(count: number): void {
    const fileTypes: ('pdf' | 'word' | 'powerpoint' | 'txt' | 'epub')[] = [
      'pdf', 'word', 'powerpoint', 'txt', 'epub'
    ];
    
    this.documents = Array.from({ length: count }, () => {
      const randomUserIndex = faker.number.int({ min: 0, max: this.users.length - 1 });
      const user = this.users[randomUserIndex];
      const fileType = fileTypes[faker.number.int({ min: 0, max: fileTypes.length - 1 })];
      const fileSizeKB = faker.number.int({ min: 100, max: 10000 });
      const fileSizeMB = (fileSizeKB / 1024).toFixed(2);
      const docId = faker.string.uuid();
      const isPublic = Math.random() > 0.3; // 70% chance of being public
      
      // Assign 1-5 random tags from the tag pool
      const tagCount = faker.number.int({ min: 1, max: 5 });
      const selectedTags: string[] = [];
      for (let i = 0; i < tagCount; i++) {
        const tagIndex = faker.number.int({ min: 0, max: this.tagPool.length - 1 });
        const tag = this.tagPool[tagIndex];
        if (!selectedTags.includes(tag)) {
          selectedTags.push(tag);
        }
      }
      
      // Add document to user's uploaded documents
      if (user.uploadedDocuments) {
        user.uploadedDocuments.push(docId);
      }
      
      return {
        id: docId,
        name: `${faker.system.fileName({ extensionCount: 0 })} ${faker.lorem.words(2)}`,
        uploadDate: faker.date.recent({ days: 100 }),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        commentCount: faker.number.int({ min: 0, max: 50 }),
        uploaderUsername: user.username,
        uploaderAvatar: user.avatar,
        thumbnailUrl: faker.image.url(),
        fileType,
        fileSize: fileSizeKB > 1000 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`,
        viewCount: faker.number.int({ min: 10, max: 5000 }),
        downloadCount: faker.number.int({ min: 0, max: 1000 }),
        tags: selectedTags,
        isPublic
      };
    });
  }
  
  private updateUserDocumentCounts(): void {
    // Calculate document counts for each user
    for (const user of this.users) {
      const userDocuments = this.documents.filter(doc => doc.uploaderUsername === user.username);
      const publicDocuments = userDocuments.filter(doc => doc.isPublic);
      
      user.totalDocumentsCount = userDocuments.length;
      user.publicDocumentsCount = publicDocuments.length;
    }
  }
  
  private generateBookmarks(): void {
    // Create a consistent set of bookmarked documents (about 15% of all documents)
    const bookmarkCount = Math.floor(this.documents.length * 0.15);
    const shuffledDocs = [...this.documents].sort(() => 0.5 - Math.random());
    this.bookmarkedDocuments = shuffledDocs.slice(0, bookmarkCount);
    
    // Also add these bookmarks to user saved documents
    if (this.users.length > 0) {
      const currentUser = this.users[0]; // Simulate current user (first in the list)
      currentUser.savedDocuments = this.bookmarkedDocuments.map(doc => doc.id);
      currentUser.savedDocumentsCount = currentUser.savedDocuments.length;
    }
  }
  
  // Public methods to access the data
  public getDocuments(): MockDocument[] {
    return this.documents;
  }
  
  public getUsers(): MockUser[] {
    return this.users;
  }
  
  public getBookmarkedDocuments(): MockDocument[] {
    return this.bookmarkedDocuments;
  }
  
  public searchDocuments(query: string): Promise<MockDocument[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          // If no query is provided, return all documents
          resolve(this.documents);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.documents.filter((doc) => {
          return (
            doc.name.toLowerCase().includes(lowerCaseQuery) ||
            doc.uploaderUsername.toLowerCase().includes(lowerCaseQuery) ||
            doc.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public searchUsers(query: string): Promise<MockUser[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve([]);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.users.filter((user) => {
          return (
            user.firstName.toLowerCase().includes(lowerCaseQuery) ||
            user.lastName.toLowerCase().includes(lowerCaseQuery) ||
            user.username.toLowerCase().includes(lowerCaseQuery)
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public searchBookmarks(query: string): Promise<MockDocument[]> {
    // Use consistent bookmarked documents
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve(this.bookmarkedDocuments);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.bookmarkedDocuments.filter((doc) => {
          return (
            doc.name.toLowerCase().includes(lowerCaseQuery) ||
            doc.uploaderUsername.toLowerCase().includes(lowerCaseQuery) ||
            doc.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public getRecentSearches(): string[] {
    return this.recentSearches;
  }
  
  // Methods to simulate data modifications (without actually changing the stored data)
  public simulateAddDocument(doc: Partial<MockDocument>): Promise<MockDocument> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a pseudo-new document but don't actually add it to the store
        const newDoc: MockDocument = {
          id: faker.string.uuid(),
          name: doc.name || `${faker.system.fileName()} ${faker.lorem.words(2)}`,
          uploadDate: new Date(),
          rating: doc.rating || 0,
          commentCount: 0,
          uploaderUsername: doc.uploaderUsername || this.users[0].username,
          uploaderAvatar: doc.uploaderAvatar || this.users[0].avatar,
          thumbnailUrl: doc.thumbnailUrl || faker.image.url(),
          fileType: doc.fileType || 'pdf',
          fileSize: doc.fileSize || `${faker.number.int({ min: 100, max: 10000 })} KB`,
          viewCount: 0,
          downloadCount: 0,
          tags: doc.tags || [],
          isPublic: doc.isPublic !== undefined ? doc.isPublic : true
        };
        resolve(newDoc);
      }, 300);
    });
  }
}

// Initialize the persistent mock data store
const mockDataStore = PersistentMockData.getInstance();

// Export a simplified API to interact with the persistent data
export const mockDataService = {
  getDocuments: () => mockDataStore.getDocuments(),
  getUsers: () => mockDataStore.getUsers(),
  getBookmarkedDocuments: () => mockDataStore.getBookmarkedDocuments(),
  searchDocuments: (query: string) => mockDataStore.searchDocuments(query),
  searchUsers: (query: string) => mockDataStore.searchUsers(query),
  searchBookmarks: (query: string) => mockDataStore.searchBookmarks(query),
  getRecentSearches: () => mockDataStore.getRecentSearches(),
  simulateAddDocument: (doc: Partial<MockDocument>) => mockDataStore.simulateAddDocument(doc)
}; 